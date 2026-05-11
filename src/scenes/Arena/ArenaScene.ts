import type { Viewport } from 'pixi-viewport';
import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import type { Entity, System } from '@core/ecs';
import type { Components } from '@gameplay/components';
import type { AdditionKind, MobKind } from '@data/balance';
import { gridToWorld, worldToGrid } from '@core/math/iso';
import { World } from '@core/ecs';
import { Layers } from '@rendering/Layers';
import { createCamera } from '@rendering/Camera';
import { TileMap } from '@rendering/TileMap';
import { AssetManager } from '@services/AssetManager';
import { playMusic, playSfx } from '@services/AudioManager';
import { isTouchDevice } from '@services/Device';
import { t } from '@services/I18nService';

import { PathfindingSystem } from '@gameplay/systems/PathfindingSystem';
import { MovementSystem } from '@gameplay/systems/MovementSystem';
import { CooldownSystem } from '@gameplay/systems/CooldownSystem';
import { CombatSystem } from '@gameplay/systems/CombatSystem';
import { AutoAttackSystem } from '@gameplay/systems/AutoAttackSystem';
import { AttackSwingSystem } from '@gameplay/systems/AttackSwingSystem';
import { AdditionSystem } from '@gameplay/systems/AdditionSystem';
import { SpellSystem } from '@gameplay/systems/SpellSystem';
import { AISystem } from '@gameplay/systems/AISystem';
import { DefenseSystem } from '@gameplay/systems/DefenseSystem';
import { DeathSystem } from '@gameplay/systems/DeathSystem';
import { DyingSystem } from '@gameplay/systems/DyingSystem';
import { ItemPickupSystem } from '@gameplay/systems/ItemPickupSystem';
import { RenderSystem } from '@rendering/systems/RenderSystem';
import { FloatingTextSystem } from '@rendering/systems/FloatingTextSystem';
import { EntityHudSystem } from '@rendering/systems/EntityHudSystem';
import { VfxSystem } from '@rendering/systems/VfxSystem';

import { spawnPlayer } from '@gameplay/entities/player';
import { spawnMob } from '@gameplay/entities/mobs';
import { spawnVfx } from '@gameplay/entities/vfx';
import { FLOAT_HEAL, spawnFloatingText } from '@gameplay/entities/floatingText';
import { InputController } from '@gameplay/controls/InputController';

import { Hud } from '@ui/Hud';
import { Hotbar, type HotbarSlot } from '@ui/Hotbar';
import { SettingsPanel } from '@ui/SettingsPanel';
import { InventoryPanel } from '@ui/InventoryPanel';
import { AdditionsPicker } from '@ui/AdditionsPicker';
import { Toast } from '@ui/Toast';
import { VirtualJoystick } from '@ui/VirtualJoystick';
import { TouchActionButtons } from '@ui/TouchActionButtons';
import { TouchMenuButtons } from '@ui/TouchMenuButtons';

import { ADDITIONS, DEFEND } from '@data/balance';
import { ITEMS, type ItemKind } from '@data/items';
import { MODE_TUNING } from '@data/mode';

import { TitleScene } from '../TitleScene';
import { GameOverScene } from '../GameOverScene';
import { RunState } from '@/store/RunState';

const PLAYER_SP_MAX = 100;
const PLAYER_MP_MAX = 60;
const ARENA_SIZE = 28;
const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
const SPAWN_GY = Math.floor(ARENA_SIZE / 2);
/** Test mob ring placed at scene enter — placeholder until the
 *  `WaveSpawnerSystem` (milestone 4) replaces this with a real curve. */
const PLACEHOLDER_MOBS: ReadonlyArray<{ kind: MobKind; gx: number; gy: number }> = [
  { kind: 'berserkMouse', gx: SPAWN_GX - 5, gy: SPAWN_GY - 4 },
  { kind: 'goblin', gx: SPAWN_GX + 5, gy: SPAWN_GY - 4 },
  { kind: 'berserkMouse', gx: SPAWN_GX - 5, gy: SPAWN_GY + 4 },
  { kind: 'goblin', gx: SPAWN_GX + 5, gy: SPAWN_GY + 4 },
];

/**
 * Survival-mode arena. Flat 28×28 tile square, no exits, no fog, no zone
 * title, no save. Reuses every gameplay system + UI component from the
 * Story scenes so the combat feel is identical — only the scene-level
 * orchestration changes (no story-specific systems, camera dezoomed via
 * `MODE_TUNING.survival.cameraZoom`, run state ticked each frame for
 * the upcoming HUD / wave spawner / level-up flows).
 *
 * v1 is intentionally minimal: a handful of placeholder mobs spawn at
 * scene enter so combat is testable. The real progression (wave
 * spawning, level-up choices, run summary, leaderboard) lands in
 * follow-up commits.
 */
export class ArenaScene implements Scene {
  readonly name = 'arena';
  private viewport: Viewport | null = null;
  private layers: Layers | null = null;
  private tilemap: TileMap | null = null;
  private world: World<Components> | null = null;
  private systems: System<Components>[] = [];
  private input: InputController | null = null;
  private hud: Hud | null = null;
  private hotbar: Hotbar | null = null;
  private settings: SettingsPanel | null = null;
  private inventoryPanel: InventoryPanel | null = null;
  private additionsPicker: AdditionsPicker | null = null;
  private toast: Toast | null = null;
  private virtualJoystick: VirtualJoystick | null = null;
  private touchActionButtons: TouchActionButtons | null = null;
  private touchMenuButtons: TouchMenuButtons | null = null;
  private playerId: Entity | null = null;
  private mobKinds = new Map<Entity, MobKind>();
  private playerDied = false;
  private cleanups: Array<() => void> = [];
  private hotbarSlots: HotbarSlot[] = [null, null, null, null, null, null, null, null];
  private activeAddition: AdditionKind = 'doubleSlash';
  private joystickEmitMs = 0;
  private joystickDriven = false;
  /** Last direction the joystick poll committed to the pathfinder. Lets us
   *  detect "release transients" — natural finger slides as the user
   *  lifts off, which fire a reversed direction for a frame or two
   *  before pointerup actually fires. */
  private lastJoystickDir: { x: number; y: number } | null = null;
  private manualCombatLockUntilMs = 0;
  /** Run timer / kills / xp / level. Ticked each frame; the upcoming
   *  HUD + level-up modal read from it. */
  private runState = new RunState();

  enter(ctx: GameContext): void {
    // Programmatic flat arena — no JSON since survival has no per-zone
    // hand-placed content (the wave spawner will own mob placement).
    this.tilemap = new TileMap({
      width: ARENA_SIZE,
      height: ARENA_SIZE,
      pathZones: [{ x: 0, y: 0, w: ARENA_SIZE, h: ARENA_SIZE }],
      groundTexture: AssetManager.getTexture('tile.forest.ground'),
      pathTextures: [AssetManager.getTexture('tile.forest.path.1')],
    });
    const bounds = this.tilemap.worldBounds();

    this.viewport = createCamera(ctx.app, {
      worldWidth: bounds.width * 2,
      worldHeight: bounds.height * 2,
    });
    ctx.app.stage.addChild(this.viewport);

    this.layers = new Layers();
    this.layers.mountWorld(this.viewport);
    this.layers.mountUi(ctx.app.stage);
    this.layers.ground.addChild(this.tilemap.container);

    // Disable manual pan / wheel-zoom in survival — the camera is
    // strictly player-locked. Pinch stays for hybrid devices.
    this.viewport.plugins.remove('drag');
    this.viewport.plugins.remove('wheel');

    this.world = new World<Components>();
    this.playerId = spawnPlayer(this.world, { gx: SPAWN_GX, gy: SPAWN_GY });

    // Dev: prefill some items so the hotbar / spell flow can be tested
    // without a wave spawner. TODO: remove once level-up rewards exist.
    const inv = this.world.getComponent(this.playerId, 'Inventory');
    if (inv) {
      inv.items.healingPotion = 5;
      inv.items.burnOut = 3;
      inv.items.gushingMagma = 2;
    }
    this.hotbarSlots[0] = { kind: 'item', item: 'healingPotion' };
    this.hotbarSlots[1] = { kind: 'item', item: 'burnOut' };
    this.hotbarSlots[2] = { kind: 'item', item: 'gushingMagma' };

    for (const mob of PLACEHOLDER_MOBS) {
      const id = spawnMob(this.world, mob.kind, mob.gx, mob.gy);
      this.mobKinds.set(id, mob.kind);
    }

    // Empty collision grid (no props, no walls) — every cell walkable.
    const collisionGrid: number[][] = Array.from({ length: ARENA_SIZE }, () =>
      Array(ARENA_SIZE).fill(0),
    );
    const pathfinding = new PathfindingSystem(collisionGrid);
    const movement = new MovementSystem();
    const cooldown = new CooldownSystem();
    const ai = new AISystem({ width: ARENA_SIZE, height: ARENA_SIZE });
    const combat = new CombatSystem();
    const autoAttack = new AutoAttackSystem();
    const swing = new AttackSwingSystem();
    const defense = new DefenseSystem();
    const death = new DeathSystem((id) => this.mobKinds.get(id) ?? null);
    const dying = new DyingSystem();
    const addition = new AdditionSystem();
    const spell = new SpellSystem();
    const pickup = new ItemPickupSystem();
    const render = new RenderSystem(this.layers);
    const floating = new FloatingTextSystem(this.layers.fx);
    const entityHud = new EntityHudSystem(this.layers.fx);
    const vfx = new VfxSystem(this.layers.fx);
    this.systems = [
      cooldown,
      ai,
      autoAttack,
      combat,
      pathfinding,
      movement,
      defense,
      death,
      dying,
      addition,
      spell,
      pickup,
      swing,
      render,
      entityHud,
      vfx,
      floating,
    ];

    // UI layer (same components as Story — they're scene-agnostic).
    this.toast = new Toast(ctx.app, this.layers.ui);
    this.hud = new Hud(ctx.app);
    this.hotbar = new Hotbar(ctx.app);
    this.hotbar.setOnSlotTap((slotIdx) => this.activateHotbarSlot(slotIdx));
    this.settings = new SettingsPanel(ctx.app);
    this.inventoryPanel = new InventoryPanel(ctx.app);
    this.inventoryPanel.setCallbacks({
      onBind: (kind, slotIdx) => this.bindItemToHotbar(kind, slotIdx),
      onUse: (kind) => this.tryConsumeItem(kind),
      onDrop: () => {
        // Survival runs are one-shot; dropping items just wastes them.
        // The inventory panel's hint still surfaces the keybind for
        // consistency, but nothing happens here.
      },
    });
    this.layers.ui.addChild(this.inventoryPanel.container);

    this.layers.ui.addChild(this.hud.container, this.hotbar.container, this.settings.container);

    // Touch overlay. Same gate as Story (`isTouchDevice()`).
    if (isTouchDevice()) {
      this.virtualJoystick = new VirtualJoystick(ctx.app);
      this.layers.ui.addChild(this.virtualJoystick.container);
      this.touchActionButtons = new TouchActionButtons(ctx.app, {
        onAttack: () => this.touchAttackNearest(),
        onAddition: () => this.input?.emitClick({ button: 'right', gx: 0, gy: 0 }),
        onAdditionLongPress: () => this.openAdditionsPicker(),
        currentAddition: () => this.activeAddition,
        additionCooldownFrac: () => this.computeActiveAdditionCdFrac(),
        onDefend: () => this.input?.emitDefend(true),
        isDefending: () => this.input?.isDefending() ?? false,
        defendCooldownFrac: () => this.input?.defendCooldownFrac() ?? 0,
      });
      this.layers.ui.addChild(this.touchActionButtons.container);
      this.touchMenuButtons = new TouchMenuButtons(ctx.app, {
        onInventory: () => {
          if (!this.inventoryPanel) return;
          if (this.inventoryPanel.isOpen) this.inventoryPanel.close();
          else this.openInventoryPanel();
        },
        onSettings: () => this.settings?.toggle(),
      });
      this.layers.ui.addChild(this.touchMenuButtons.container);
      this.additionsPicker = new AdditionsPicker(ctx.app);
      this.layers.ui.addChild(this.additionsPicker.container);
    }

    const playerWorld = gridToWorld(SPAWN_GX, SPAWN_GY);
    this.viewport.moveCenter(playerWorld.x, playerWorld.y);
    // Pull the camera out a notch so the player can read incoming waves
    // earlier. Applied AFTER moveCenter so the zoom pivots around the
    // player's spawn instead of the world origin.
    this.viewport.setZoom(MODE_TUNING.survival.cameraZoom, true);
    this.viewport.moveCenter(playerWorld.x, playerWorld.y);

    this.input = new InputController({
      app: ctx.app,
      viewport: this.viewport,
      gridWidth: ARENA_SIZE,
      gridHeight: ARENA_SIZE,
    });

    this.input.onClick((cmd) => {
      if (!this.world || this.playerId === null) return;
      if (this.settings?.isOpen) return;
      if (this.inventoryPanel?.isOpen) return;
      if (this.world.hasComponent(this.playerId, 'Defending')) return;
      if (this.world.hasComponent(this.playerId, 'Addition')) return;
      if (this.world.hasComponent(this.playerId, 'Spell')) return;

      if (cmd.button === 'right') {
        this.tryTriggerAddition(this.activeAddition);
        return;
      }
      if (cmd.button === 'left') {
        const target = this.findEnemyAtCell(cmd.gx, cmd.gy);
        if (target !== null) {
          this.world.addComponent(this.playerId, 'CombatIntent', { targetId: target });
          this.manualCombatLockUntilMs = performance.now() + 600;
          const tp = this.world.getComponent(target, 'Position');
          if (tp) {
            spawnVfx(this.world, {
              kind: 'clickAttack',
              x: tp.x,
              y: tp.y,
              radius: 32,
              durationMs: 350,
            });
          }
          return;
        }
      }
      this.world.removeComponent(this.playerId, 'CombatIntent');
      const pf = this.world.getComponent(this.playerId, 'Pathfinder');
      if (pf) {
        pf.targetGrid = { gx: cmd.gx, gy: cmd.gy };
        pf.waypoints = null;
        pf.computing = false;
      }
      const tilePos = gridToWorld(cmd.gx, cmd.gy);
      spawnVfx(this.world, {
        kind: 'clickMove',
        x: tilePos.x,
        y: tilePos.y,
        radius: 0,
        durationMs: 350,
      });
    });

    this.input.onDefendChange((active) => {
      if (!this.world || this.playerId === null) return;
      if (active) {
        if (
          this.world.hasComponent(this.playerId, 'Addition') ||
          this.world.hasComponent(this.playerId, 'Spell')
        ) {
          this.input?.emitDefend(false);
          return;
        }
        this.world.addComponent(this.playerId, 'Defending', {
          elapsedMs: 0,
          totalMs: DEFEND.durationMs,
        });
        this.world.removeComponent(this.playerId, 'CombatIntent');
        const pf = this.world.getComponent(this.playerId, 'Pathfinder');
        if (pf) {
          pf.targetGrid = null;
          pf.waypoints = null;
          pf.computing = false;
        }
        const hp = this.world.getComponent(this.playerId, 'Health');
        const pos = this.world.getComponent(this.playerId, 'Position');
        if (hp) {
          const want = Math.round(hp.max * DEFEND.healFrac);
          const healed = Math.min(hp.max, hp.current + want) - hp.current;
          hp.current += healed;
          if (healed > 0 && pos) {
            spawnFloatingText(this.world, {
              x: pos.x,
              y: pos.y,
              text: `+${healed}`,
              color: FLOAT_HEAL,
            });
          }
        }
      } else {
        this.world.removeComponent(this.playerId, 'Defending');
      }
    });

    this.input.onSlot((slotIdx) => this.activateHotbarSlot(slotIdx));

    // Settings: Resume / Quit-to-Title. Survival quits straight back to
    // the menu — no zone save to write.
    this.settings.onAction((action) => {
      this.settings?.hide();
      if (action === 'quit-to-title') {
        queueMicrotask(() => {
          void ctx.scenes.switchTo(new TitleScene(), ctx);
        });
      }
    });

    // Pickup: route mob drops into the inventory + hotbar like Story
    // mode so the test items can be replenished from kills.
    pickup.onPickup(({ kind, result, gold }) => {
      if (result === 'full') {
        this.toast?.show(t('inventory.full'));
        return;
      }
      playSfx('items.pickup');
      if (result === 'gold' && gold !== undefined) return;
      this.autoBindItemToHotbar(kind);
    });

    // Death wires the GameOver fallback for v1. Will be replaced by a
    // dedicated RunSummaryScene + leaderboard write in a later commit.
    death.onPlayerDeath(() => {
      this.playerDied = true;
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new GameOverScene(), ctx);
      });
    });

    playMusic('music.forestAmbient');
  }

  exit(ctx: GameContext): void {
    for (const c of this.cleanups) c();
    this.cleanups.length = 0;
    this.input?.destroy();
    this.input = null;
    this.hud?.destroy();
    this.hud = null;
    this.hotbar?.destroy();
    this.hotbar = null;
    this.settings?.destroy();
    this.settings = null;
    this.inventoryPanel?.destroy();
    this.inventoryPanel = null;
    this.additionsPicker?.destroy();
    this.additionsPicker = null;
    this.toast?.destroy();
    this.toast = null;
    this.virtualJoystick?.destroy();
    this.virtualJoystick = null;
    this.touchActionButtons?.destroy();
    this.touchActionButtons = null;
    this.touchMenuButtons?.destroy();
    this.touchMenuButtons = null;
    for (const sys of this.systems) {
      const destroyable = sys as { destroy?: () => void };
      destroyable.destroy?.();
    }
    this.systems = [];
    this.world = null;
    this.playerId = null;
    this.mobKinds.clear();

    if (this.viewport) {
      ctx.app.stage.removeChild(this.viewport);
      this.viewport.destroy({ children: true });
      this.viewport = null;
    }
    if (this.layers) {
      this.layers.destroy();
      this.layers = null;
    }
    this.tilemap = null;
  }

  update(dt: number): void {
    if (!this.world) return;
    if (this.settings?.isOpen) {
      this.runState.setPaused(true);
      return;
    }
    if (this.inventoryPanel?.isOpen) {
      this.runState.setPaused(true);
      if (this.playerId !== null) {
        const inv = this.world.getComponent(this.playerId, 'Inventory');
        this.inventoryPanel.setState({
          items: inv ? { ...inv.items } : {},
          gold: inv?.gold ?? 0,
          hotbarSlots: this.hotbarSlots,
        });
      }
      return;
    }
    this.runState.setPaused(false);
    this.runState.tick(dt);

    for (const sys of this.systems) {
      if (!this.world) break;
      sys.update(dt, this.world);
    }
    if (!this.world) return;

    this.input?.tickCooldowns(dt);
    if (
      this.input?.isDefending() &&
      this.playerId !== null &&
      !this.world.hasComponent(this.playerId, 'Defending')
    ) {
      this.input.emitDefend(false);
    }

    this.pollJoystickMove();

    if (this.playerId !== null) {
      const hp = this.world.getComponent(this.playerId, 'Health');
      if (hp && this.hud) this.hud.setHealth(hp.current, hp.max);
      if (this.hud) {
        this.hud.setSp(0, PLAYER_SP_MAX);
        this.hud.setMp(0, PLAYER_MP_MAX);
        // Hijack the level + xp readout to display run state — until the
        // dedicated survival HUD overlay lands in a later milestone.
        this.hud.setLevel(this.runState.read().level);
        this.hud.setXp(this.runState.read().kills, 0);
        const zoom = this.viewport?.scale.x ?? 1;
        this.hud.setZoom(zoom);
      }

      // Camera always follows the player in survival.
      const pos = this.world.getComponent(this.playerId, 'Position');
      if (pos && this.viewport) this.viewport.moveCenter(pos.x, pos.y);

      // Hotbar repaint with the standard locked / cooldown cues.
      const cd = this.world.getComponent(this.playerId, 'SkillCooldown');
      const additionCooldowns: Partial<Record<AdditionKind, number>> = {};
      if (cd) {
        for (const k of Object.keys(cd.remainingMs) as AdditionKind[]) {
          const remaining = cd.remainingMs[k] ?? 0;
          const total = ADDITIONS[k]?.cooldownMs ?? 0;
          if (remaining > 0 && total > 0) {
            additionCooldowns[k] = Math.min(1, remaining / total);
          }
        }
      }
      if (this.hotbar) {
        const inv = this.world.getComponent(this.playerId, 'Inventory');
        const itemsLocked =
          this.world.hasComponent(this.playerId, 'Addition') ||
          this.world.hasComponent(this.playerId, 'Spell') ||
          this.world.hasComponent(this.playerId, 'Defending');
        this.hotbar.setState({
          slots: this.hotbarSlots,
          additionCooldowns,
          itemCounts: inv?.items ?? {},
          itemsLocked,
        });
      }
    }
  }

  // ---- helpers ----------------------------------------------------------

  private findEnemyAtCell(gx: number, gy: number): Entity | null {
    if (!this.world) return null;
    const target = gridToWorld(gx, gy);
    let best: Entity | null = null;
    let bestDist = 56; // ~¾ tile, generous tap radius
    for (const id of this.world.query(['Faction', 'Position', 'Health'])) {
      if (this.world.hasComponent(id, 'Dying')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      const pos = this.world.getComponent(id, 'Position');
      const hp = this.world.getComponent(id, 'Health');
      if (!fac || !pos || !hp || fac.side === 'player' || hp.current <= 0) continue;
      const d = Math.hypot(pos.x - target.x, pos.y - target.y);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    return best;
  }

  private pickSpellTarget(px: number, py: number): Entity | null {
    if (!this.world || this.playerId === null) return null;
    const intent = this.world.getComponent(this.playerId, 'CombatIntent');
    if (intent !== undefined) {
      const th = this.world.getComponent(intent.targetId, 'Health');
      if (
        th &&
        th.current > 0 &&
        !this.world.hasComponent(intent.targetId, 'Dying') &&
        !this.world.hasComponent(intent.targetId, 'Hidden')
      ) {
        return intent.targetId;
      }
    }
    let bestId: Entity | null = null;
    let bestDist = Infinity;
    for (const id of this.world.query(['Health', 'Position', 'Faction'])) {
      if (id === this.playerId) continue;
      if (this.world.hasComponent(id, 'Dying')) continue;
      if (this.world.hasComponent(id, 'Hidden')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const pos = this.world.getComponent(id, 'Position');
      const hp = this.world.getComponent(id, 'Health');
      if (!pos || !hp || hp.current <= 0) continue;
      const d = Math.hypot(pos.x - px, pos.y - py);
      if (d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    }
    return bestId;
  }

  private tryTriggerAddition(kind: AdditionKind): void {
    if (!this.world || this.playerId === null) return;
    if (this.world.hasComponent(this.playerId, 'Addition')) return;
    if (this.world.hasComponent(this.playerId, 'Spell')) return;
    if (this.world.hasComponent(this.playerId, 'Defending')) return;
    const def = ADDITIONS[kind];
    if (!def) return;
    const cd = this.world.getComponent(this.playerId, 'SkillCooldown');
    if (cd && (cd.remainingMs[kind] ?? 0) > 0) {
      this.toast?.show(t('addition.cooldown'));
      return;
    }
    const stats = this.world.getComponent(this.playerId, 'Stats');
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!stats || !pos) return;
    const target = this.pickSpellTarget(pos.x, pos.y);
    if (target === null) {
      this.toast?.show(t('addition.noTarget'));
      return;
    }
    const tp = this.world.getComponent(target, 'Position');
    if (!tp) return;
    const dx = tp.x - pos.x;
    const dy = tp.y - pos.y;
    const len = Math.hypot(dx, dy) || 1;
    this.world.addComponent(this.playerId, 'Addition', {
      kind,
      elapsedMs: 0,
      totalMs: def.totalMs,
      hitsApplied: 0,
      targetId: target,
      dirX: dx / len,
      dirY: dy / len,
    });
    if (cd) cd.remainingMs[kind] = def.cooldownMs;
    const pf = this.world.getComponent(this.playerId, 'Pathfinder');
    if (pf) {
      pf.waypoints = null;
      pf.targetGrid = null;
    }
    playSfx('combat.swing');
  }

  private tryConsumeItem(kind: ItemKind): void {
    if (!this.world || this.playerId === null) return;
    if (this.playerDied) return;
    if (this.settings?.isOpen) return;
    if (
      this.world.hasComponent(this.playerId, 'Addition') ||
      this.world.hasComponent(this.playerId, 'Spell') ||
      this.world.hasComponent(this.playerId, 'Defending')
    ) {
      this.toast?.show(t('inventory.busy'));
      return;
    }
    if (this.world.hasComponent(this.playerId, 'Dying')) return;

    const inv = this.world.getComponent(this.playerId, 'Inventory');
    if (!inv) return;
    const count = inv.items[kind] ?? 0;
    if (count <= 0) {
      this.toast?.show(t('inventory.empty'));
      return;
    }
    const def = ITEMS[kind];
    const use = def.use;
    if (!use) return;

    if (use.kind === 'heal') {
      const hp = this.world.getComponent(this.playerId, 'Health');
      const pos = this.world.getComponent(this.playerId, 'Position');
      if (!hp || !pos) return;
      const healAmount = Math.max(1, Math.round(hp.max * use.percentMaxHp));
      const healed = Math.min(hp.max, hp.current + healAmount) - hp.current;
      if (healed <= 0) {
        this.toast?.show(t('inventory.empty'));
        return;
      }
      hp.current += healed;
      inv.items[kind] = count - 1;
      spawnFloatingText(this.world, {
        x: pos.x,
        y: pos.y,
        text: `+${healed}`,
        color: FLOAT_HEAL,
      });
      playSfx('items.pickup');
      return;
    }
    // Spell items reuse the targeting helper above so behaviour is in
    // lockstep with Story scenes. Full spell wiring is intentionally
    // omitted from v1 — players who want to fire a spell on tap should
    // pick the item up from the placeholder inventory; lifting the
    // full path into a shared helper will happen when the next refactor
    // pass dedupes Forest / Arena.
  }

  private autoBindItemToHotbar(kind: ItemKind): void {
    if (!ITEMS[kind].bindable) return;
    if (this.hotbarSlots.some((s) => s !== null && s.kind === 'item' && s.item === kind)) return;
    const free = this.hotbarSlots.findIndex((s) => s === null);
    if (free === -1) return;
    this.hotbarSlots[free] = { kind: 'item', item: kind };
  }

  private bindItemToHotbar(kind: ItemKind, slotIdx: number): void {
    if (slotIdx < 0 || slotIdx >= this.hotbarSlots.length) return;
    this.hotbarSlots[slotIdx] = { kind: 'item', item: kind };
  }

  private activateHotbarSlot(slotIdx: number): void {
    if (this.inventoryPanel?.isOpen) {
      const sel = this.inventoryPanel.getSelectedKind();
      if (sel) this.bindItemToHotbar(sel, slotIdx);
      return;
    }
    const slot = this.hotbarSlots[slotIdx] ?? null;
    if (!slot) return;
    if (slot.kind === 'addition') this.tryTriggerAddition(slot.addition);
    else if (slot.kind === 'item') this.tryConsumeItem(slot.item);
  }

  private openInventoryPanel(): void {
    if (!this.inventoryPanel || !this.world || this.playerId === null) return;
    const inv = this.world.getComponent(this.playerId, 'Inventory');
    this.inventoryPanel.open({
      items: inv ? { ...inv.items } : {},
      gold: inv?.gold ?? 0,
      hotbarSlots: this.hotbarSlots,
    });
  }

  private openAdditionsPicker(): void {
    if (!this.additionsPicker) return;
    this.additionsPicker.open([this.activeAddition], this.activeAddition, (kind) => {
      this.activeAddition = kind;
    });
  }

  private computeActiveAdditionCdFrac(): number {
    if (!this.world || this.playerId === null) return 0;
    const cd = this.world.getComponent(this.playerId, 'SkillCooldown');
    if (!cd) return 0;
    const remaining = cd.remainingMs[this.activeAddition] ?? 0;
    const total = ADDITIONS[this.activeAddition]?.cooldownMs ?? 0;
    if (remaining <= 0 || total <= 0) return 0;
    return Math.min(1, remaining / total);
  }

  private touchAttackNearest(): void {
    if (!this.world || this.playerId === null || !this.input) return;
    const stats = this.world.getComponent(this.playerId, 'Stats');
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!stats || !pos) return;
    const target = this.pickSpellTarget(pos.x, pos.y);
    if (target === null) return;
    const tp = this.world.getComponent(target, 'Position');
    if (!tp) return;
    const grid = worldToGrid(tp.x, tp.y);
    this.input.emitClick({
      button: 'left',
      gx: Math.round(grid.x),
      gy: Math.round(grid.y),
    });
  }

  /** Touch joystick poll — see ForestScene for the full rationale. */
  private pollJoystickMove(): void {
    if (!this.virtualJoystick || !this.input || !this.world || this.playerId === null) return;
    const dir = this.virtualJoystick.direction();
    if (!dir) {
      if (this.joystickDriven) {
        this.joystickDriven = false;
        this.lastJoystickDir = null;
        if (!this.world.hasComponent(this.playerId, 'CombatIntent')) {
          const pf = this.world.getComponent(this.playerId, 'Pathfinder');
          if (pf) {
            pf.targetGrid = null;
            pf.waypoints = null;
            pf.computing = false;
          }
        }
      }
      return;
    }
    // Suppress release transients: when the finger naturally slides off
    // the joystick on lift-off, it briefly reports a reversed direction
    // with falling magnitude. Skipping the emit in that case prevents
    // Dart from taking a step in the wrong direction in the frame
    // before `pointerup` actually fires and the joystick releases.
    if (this.lastJoystickDir) {
      const dot = this.lastJoystickDir.x * dir.x + this.lastJoystickDir.y * dir.y;
      if (dot < 0 && dir.magnitude < 0.8) return;
    }
    const now = performance.now();
    if (now - this.joystickEmitMs < 150) return;
    if (now < this.manualCombatLockUntilMs) return;
    this.joystickEmitMs = now;
    this.joystickDriven = true;
    this.lastJoystickDir = { x: dir.x, y: dir.y };
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!pos) return;
    const STEPS = 2;
    const tileDiag = Math.sqrt(64 * 64 + 32 * 32);
    const targetWx = pos.x + dir.x * STEPS * tileDiag;
    const targetWy = pos.y + dir.y * STEPS * tileDiag;
    const grid = worldToGrid(targetWx, targetWy);
    this.input.emitClick({
      button: 'left',
      gx: Math.round(grid.x),
      gy: Math.round(grid.y),
    });
  }
}
