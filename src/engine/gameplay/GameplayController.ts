/**
 * Shared gameplay orchestrator. Owns the world, the ECS systems
 * pipeline, the rendering viewport, the input controller, and the
 * UI cluster — i.e. everything that used to live duplicated in
 * Forest / Hellena / Arena scenes.
 *
 * A scene now reduces to a `SceneConfig` plus a thin `Scene` wrapper
 * that delegates `enter` / `exit` / `update` to this controller. New
 * zones / modes drop in by writing a new config; the controller's
 * pipeline stays untouched.
 *
 * Public API kept tight: scenes interact through hooks and the
 * read-only handles surfaced on the controller (world, ui, viewport).
 */
import type { FederatedPointerEvent } from 'pixi.js';
import { Graphics } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';

import type { Entity, System } from '@core/ecs';
import { World } from '@core/ecs';
import { gridToWorld, worldToGrid } from '@core/math/iso';

import type { Components } from '@gameplay/components';
import type { AdditionKind, MobKind } from '@data/balance';
import { ADDITIONS, DEFEND } from '@data/balance';
import { ITEMS, type ItemKind } from '@data/items';
import { SPELLS, type SpellKind } from '@data/spells';
import { MODE_TUNING } from '@data/mode';

import { InputController } from '@gameplay/controls/InputController';
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
import { ExitSystem } from '@gameplay/systems/ExitSystem';
import { InteractableSystem } from '@gameplay/systems/InteractableSystem';
import { DeathSystem } from '@gameplay/systems/DeathSystem';
import { DyingSystem } from '@gameplay/systems/DyingSystem';
import { ItemPickupSystem } from '@gameplay/systems/ItemPickupSystem';
import { EncounterSystem } from '@gameplay/systems/EncounterSystem';

import { RenderSystem } from '@rendering/systems/RenderSystem';
import { FloatingTextSystem } from '@rendering/systems/FloatingTextSystem';
import { EntityHudSystem } from '@rendering/systems/EntityHudSystem';
import { VfxSystem } from '@rendering/systems/VfxSystem';
import { FogOfWarOverlay } from '@rendering/FogOfWarOverlay';
import { TileMap } from '@rendering/TileMap';
import { createCamera } from '@rendering/Camera';
import { Layers } from '@rendering/Layers';

import { spawnPlayer } from '@gameplay/entities/player';
import { spawnMob } from '@gameplay/entities/mobs';
import { spawnProp } from '@gameplay/entities/props';
import { spawnExit } from '@gameplay/entities/props/exit';
import { spawnInteractable } from '@gameplay/entities/interactables';
import { spawnVfx } from '@gameplay/entities/vfx';
import { FLOAT_HEAL, spawnFloatingText } from '@gameplay/entities/floatingText';

import { propBlocks, propBlocksSight } from '@data/props';
import {
  buildCollisionGrid,
  buildSightBlockingGrid,
  type MapData,
} from '@scenes/ForestOfSeles/MapLoader';

import { AssetManager } from '@services/AssetManager';
import { FogOfWar } from '@services/FogOfWar';
import { playMusic, playSfx, stopMusic, type MusicAlias } from '@services/AudioManager';
import { t } from '@services/I18nService';

import { VisionHalo } from '@ui/VisionHalo';
import type { HotbarSlot } from '@ui/Hotbar';
import type { InventoryPanelState } from '@ui/InventoryPanel';

import { GameplayUI } from './GameplayUI';
import type { GameplayUIHandlers } from './GameplayUI';
import type { GameplaySnapshot, SceneConfig } from './SceneConfig';
import type { GameContext } from '@/Game';

const PLAYER_SP_MAX = 100;
const PLAYER_MP_MAX = 60;
/** ~3/4 of a tile width — generous tap tolerance for click-to-target. */
const ENEMY_PICK_RADIUS_PX = 96;
const JOYSTICK_THROTTLE_MS = 150;
const JOYSTICK_PROJECTION_TILES = 2;
const MANUAL_COMBAT_LOCK_MS = 600;

/**
 * Concrete orchestrator. Created once per gameplay scene enter, lives
 * for the duration of the scene, destroyed on exit.
 */
export class GameplayController {
  // --- Pixi / rendering ----------------------------------------------
  readonly viewport: Viewport;
  readonly layers: Layers;
  readonly tilemap: TileMap;
  // --- ECS ------------------------------------------------------------
  readonly world: World<Components>;
  readonly systems: System<Components>[];
  // --- Input ----------------------------------------------------------
  readonly input: InputController;
  // --- UI -------------------------------------------------------------
  readonly ui: GameplayUI;
  // --- State ----------------------------------------------------------
  playerId: Entity | null = null;
  readonly mobKinds = new Map<Entity, MobKind>();
  hotbarSlots: HotbarSlot[];
  activeAddition: AdditionKind = 'doubleSlash';
  playerDied = false;
  // --- Joystick -------------------------------------------------------
  private joystickEmitMs = 0;
  private joystickDriven = false;
  private manualCombatLockUntilMs = 0;
  // --- Fog (story only) ----------------------------------------------
  readonly fog: FogOfWar | null;
  readonly fogOverlay: FogOfWarOverlay | null;
  readonly visionHalo: VisionHalo | null;
  // --- Misc ----------------------------------------------------------
  private readonly ctx: GameContext;
  private readonly config: SceneConfig;
  readonly encounterSystem: EncounterSystem | null;
  private readonly cleanups: Array<() => void> = [];
  /** Latest pointer position in world coords — set by pointermove on the
   *  viewport, read each frame by the cursor-overlay update to decide
   *  default vs. attack mode. Null until the first pointermove. */
  private lastMouseWorld: { x: number; y: number } | null = null;
  /** Active ground-targeting state for groundAoE spells. */
  private groundTargeting: {
    spell: SpellKind;
    itemKind: ItemKind;
    aoeRadiusPx: number;
    castRangePx: number;
    cursor: Graphics;
    cleanups: Array<() => void>;
  } | null = null;

  constructor(ctx: GameContext, config: SceneConfig) {
    this.ctx = ctx;
    this.config = config;
    const map = config.map;
    const o = config.overrides ?? {};
    const tuning = MODE_TUNING[config.mode];
    const enableFog = o.enableFogOfWar ?? map.fov === true;

    // --- Tilemap + camera + layers ----------------------------------
    this.tilemap = new TileMap({
      width: map.size.w,
      height: map.size.h,
      pathZones: map.pathZones,
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

    // Pan / wheel are off in fog zones (player would otherwise drift
    // out of the lit area) and on survival (strictly player-locked).
    const enablePan = o.enablePan ?? !(enableFog || config.mode === 'survival');
    if (!enablePan) {
      this.viewport.plugins.remove('drag');
      this.viewport.plugins.remove('wheel');
    }

    // --- Fog setup (story wild zones) -------------------------------
    if (enableFog) {
      const sightGrid = buildSightBlockingGrid(map, propBlocksSight);
      const zoneId = o.fogSaveZoneId ?? 'forest';
      this.fog = new FogOfWar(
        map.size.w,
        map.size.h,
        (gx, gy) => sightGrid[gy]?.[gx] ?? false,
        config.saveData?.fogByZone?.[zoneId],
      );
      this.fogOverlay = new FogOfWarOverlay(this.fog);
      this.layers.fog.addChild(this.fogOverlay.container);
      this.visionHalo = new VisionHalo(ctx.app);
      this.visionHalo.mount(ctx.app.stage, this.viewport);
    } else {
      this.fog = null;
      this.fogOverlay = null;
      this.visionHalo = null;
    }

    // --- ECS world + player + map content ---------------------------
    this.world = new World<Components>();
    const spawn = o.spawnOverride ?? map.spawn;
    this.playerId = spawnPlayer(this.world, { gx: spawn.gx, gy: spawn.gy });

    // Prefill inventory + hotbar (used by both Survival dev loadout and
    // future starter-kit configs). Saved games override below.
    if (config.prefilledInventory) {
      const inv = this.world.getComponent(this.playerId, 'Inventory');
      if (inv) {
        Object.assign(inv.items, config.prefilledInventory);
      }
    }
    this.hotbarSlots =
      config.prefilledHotbar !== undefined
        ? [
            ...config.prefilledHotbar,
            ...Array(Math.max(0, 8 - config.prefilledHotbar.length)).fill(null),
          ]
        : [null, null, null, null, null, null, null, null];

    // Save restoration. Inventory + hotbar + progression + activeAddition
    // transfer across zones (the player is the same character regardless of
    // where they entered from). HP and grid position only transfer when the
    // save was recorded IN this zone — cross-zone arrivals top up to max via
    // the scene's character-row apply pass.
    const save = config.saveData ?? null;
    if (save) {
      const inv = this.world.getComponent(this.playerId, 'Inventory');
      if (inv) {
        inv.items = { ...save.inventory.items };
        inv.gold = save.inventory.gold;
      }
      const prog = this.world.getComponent(this.playerId, 'Progression');
      if (prog) {
        prog.level = save.progression.level;
        prog.xp = save.progression.xp;
        prog.xpToNext = save.progression.xpToNext;
      }
      this.hotbarSlots = [...save.hotbar];
      this.activeAddition = save.activeAddition;
      const fromThisZone = o.fogSaveZoneId !== undefined && save.currentZoneId === o.fogSaveZoneId;
      if (fromThisZone) {
        const hp = this.world.getComponent(this.playerId, 'Health');
        if (hp) hp.current = save.player.hp;
      }
    }

    for (const prop of map.props) spawnProp(this.world, prop);
    for (const exit of map.exits) spawnExit(this.world, exit);
    for (const mob of map.mobs) {
      const id = spawnMob(this.world, mob.kind, mob.gx, mob.gy);
      this.mobKinds.set(id, mob.kind);
    }
    for (const inter of map.interactables) {
      spawnInteractable(this.world, inter);
    }

    // --- Systems pipeline -------------------------------------------
    const collisionGrid = buildCollisionGrid(map, propBlocks);
    const cooldown = new CooldownSystem();
    const ai = new AISystem({ width: map.size.w, height: map.size.h });
    const autoAttack = new AutoAttackSystem();
    const combat = new CombatSystem();
    const pathfinding = new PathfindingSystem(collisionGrid);
    const movement = new MovementSystem();
    const exits = new ExitSystem();
    const interactables = new InteractableSystem();
    const defense = new DefenseSystem();
    const death = new DeathSystem({
      mobKindResolver: (id) => this.mobKinds.get(id) ?? null,
      awardPlayerXp: o.awardPlayerXp ?? true,
    });
    const dying = new DyingSystem();
    const addition = new AdditionSystem();
    const spell = new SpellSystem();
    const pickup = new ItemPickupSystem();
    const swing = new AttackSwingSystem();
    const render = new RenderSystem(this.layers);
    const floating = new FloatingTextSystem(this.layers.fx);
    const entityHud = new EntityHudSystem(this.layers.fx);
    const vfx = new VfxSystem(this.layers.fx);

    const enableEnc = o.enableEncounters ?? false;
    this.encounterSystem =
      enableEnc && o.encounterZoneId
        ? new EncounterSystem(
            o.encounterZoneId,
            { width: map.size.w, height: map.size.h },
            (gx, gy) => collisionGrid[gy]?.[gx] === 0,
            (entity, kind) => this.mobKinds.set(entity, kind),
          )
        : null;

    // Pipeline ordering matters — see ForestScene.ts for the rationale
    // (preserved here verbatim so behaviour is byte-identical to the
    // pre-refactor scenes).
    this.systems = [
      cooldown,
      ai,
      autoAttack, // before CombatSystem so engages take effect same tick
      combat,
      pathfinding,
      movement,
      exits,
      interactables,
      defense,
      death,
      dying,
      addition,
      spell,
      ...(this.encounterSystem ? [this.encounterSystem] : []),
      pickup,
      // swing runs AFTER combat (which spawns the AttackSwing) and
      // BEFORE render, but its dt advance can't happen on the same
      // frame it was created — placement here keeps both invariants.
      swing,
      render,
      // entityHud must run AFTER render so it reads the same Position
      // values used to place the sprites this frame.
      entityHud,
      vfx,
      floating,
    ];

    // --- UI cluster -------------------------------------------------
    const uiHandlers: GameplayUIHandlers = {
      onSettingsAction: (action) => {
        this.ui.settings.hide();
        if (action === 'quit-to-title') {
          this.config.hooks?.onPersist?.(this.snapshot());
          this.config.hooks?.onQuit?.(this.ctx);
        }
      },
      inventoryCallbacks: {
        onBind: (kind, slotIdx) => this.bindItemToHotbar(kind, slotIdx),
        onUse: (kind) => this.tryConsumeItem(kind),
        onDrop: (kind) => this.config.hooks?.onDropItem?.(kind),
      },
      onInventoryToggle: () => {
        if (this.ui.inventoryPanel.isOpen) this.ui.inventoryPanel.close();
        else this.openInventoryPanel();
      },
      onHotbarSlotTap: (slotIdx) => this.activateHotbarSlot(slotIdx),
      onTouchAttack: () => this.touchAttackNearest(),
      onTouchAddition: () => this.input.emitClick({ button: 'right', gx: 0, gy: 0 }),
      onTouchAdditionLongPress: () => this.openAdditionsPicker(),
      getCurrentAddition: () => this.activeAddition,
      getAdditionCooldownFrac: () => this.computeActiveAdditionCdFrac(),
      onTouchDefend: () => this.input.emitDefend(true),
      getIsDefending: () => this.input.isDefending(),
      getDefendCooldownFrac: () => this.input.defendCooldownFrac(),
      onAdditionsBarSelect: (kind) => {
        this.activeAddition = kind;
      },
    };
    this.ui = new GameplayUI(ctx.app, this.layers, config, uiHandlers, {
      fog: this.fog,
      pathZones: map.pathZones,
      viewport: this.viewport,
    });

    // Cursor overlay needs per-frame world-space pointer coords to decide
    // between default and attack mode. Tracking lives on the controller so
    // findEnemyAtWorld can be used directly.
    if (this.ui.cursorOverlay) {
      const onPointerMove = (e: FederatedPointerEvent): void => {
        const local = this.viewport.toWorld(e.global);
        this.lastMouseWorld = { x: local.x, y: local.y };
      };
      this.viewport.on('pointermove', onPointerMove);
      this.cleanups.push(() => this.viewport.off('pointermove', onPointerMove));
    }

    // Auto-persist when the user leaves the tab. Scenes with no save (e.g.
    // Survival) ignore the hook so this is a no-op there.
    const onVisibility = (): void => {
      if (document.hidden) this.persist();
    };
    document.addEventListener('visibilitychange', onVisibility);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));

    // Inventory panel keyboard shortcuts. `I` toggles the panel, `Esc`
    // closes it, `D` drops the currently-selected item via the scene's
    // onDropItem hook. Number keys 1..8 are handled by InputController
    // and resolved in activateHotbarSlot (re-bind when the panel is open).
    const onInventoryKey = (e: KeyboardEvent): void => {
      if (e.key === 'i' || e.key === 'I') {
        if (this.ui.inventoryPanel.isOpen) this.ui.inventoryPanel.close();
        else this.openInventoryPanel();
        return;
      }
      if (this.ui.inventoryPanel.isOpen) {
        if (e.key === 'Escape') this.ui.inventoryPanel.close();
        else if (e.key === 'd' || e.key === 'D') {
          const sel = this.ui.inventoryPanel.getSelectedKind();
          if (sel) this.config.hooks?.onDropItem?.(sel);
        }
      }
    };
    window.addEventListener('keydown', onInventoryKey);
    this.cleanups.push(() => window.removeEventListener('keydown', onInventoryKey));

    // --- Camera initial centre + zoom ------------------------------
    const playerWorld = gridToWorld(spawn.gx, spawn.gy);
    this.viewport.moveCenter(playerWorld.x, playerWorld.y);
    const zoom = o.cameraZoom ?? tuning.cameraZoom;
    if (zoom !== 1.0) {
      this.viewport.setZoom(zoom, true);
      this.viewport.moveCenter(playerWorld.x, playerWorld.y);
    }

    // --- Input controller + handler wiring ------------------------
    this.input = new InputController({
      app: ctx.app,
      viewport: this.viewport,
      gridWidth: map.size.w,
      gridHeight: map.size.h,
    });
    this.input.setIgnorePointerCheck(
      (pointerId) => this.ui.virtualJoystick?.getActivePointerId() === pointerId,
    );
    this.input.onClick((cmd) => this.handleClick(cmd));
    this.input.onDefendChange((active) => this.handleDefendChange(active));
    this.input.onSlot((slotIdx) => this.activateHotbarSlot(slotIdx));

    // --- System-driven hooks ---------------------------------------
    death.onPlayerDeath(() => {
      this.playerDied = true;
      this.config.hooks?.onPlayerDeath?.(ctx);
    });
    death.onMobDeath((kind) => {
      this.config.hooks?.onMobDeath?.(kind);
    });
    exits.onTrigger(({ exit }) => {
      this.config.hooks?.onZoneExit?.(ctx, exit);
    });
    interactables.onTrigger(({ interactable }) => {
      this.config.hooks?.onInteract?.(interactable);
      // Default: surface the message key as a toast.
      if (interactable.messageKey) this.ui.toast.show(t(interactable.messageKey));
    });
    pickup.onPickup(({ kind, result, gold }) => {
      const r = result === 'gold' ? 'gold' : result === 'full' ? 'full' : 'ok';
      if (r === 'full') this.ui.toast.show(t('inventory.full'));
      else playSfx('items.pickup');
      if (r === 'ok') this.autoBindItemToHotbar(kind);
      this.config.hooks?.onPickup?.(kind, r, gold);
    });

    // --- Music start ------------------------------------------------
    const music: MusicAlias | undefined = o.musicAlias;
    if (music) playMusic(music);

    // --- Zone title (story) -----------------------------------------
    if (this.ui.zoneTitle) {
      this.ui.zoneTitle.show(t(`zones.${map.name}.name`) || map.name, '');
    }
  }

  // ====================================================================
  // Lifecycle
  // ====================================================================

  update(dt: number): void {
    if (!this.world) return;
    if (this.ui.isPaused()) return;

    for (const sys of this.systems) {
      if (!this.world) break;
      sys.update(dt, this.world);
    }

    this.input.tickCooldowns(dt);
    // Sync defend state — DefenseSystem auto-clears `Defending` when
    // the timer expires, but InputController owns the cooldown flag.
    if (
      this.input.isDefending() &&
      this.playerId !== null &&
      !this.world.hasComponent(this.playerId, 'Defending')
    ) {
      this.input.emitDefend(false);
    }

    this.pollJoystickMove();

    // --- HUD refresh -----------------------------------------------
    if (this.playerId !== null) {
      const hp = this.world.getComponent(this.playerId, 'Health');
      const pos = this.world.getComponent(this.playerId, 'Position');
      if (hp) this.ui.hud.setHealth(hp.current, hp.max);
      this.ui.hud.setSp(0, PLAYER_SP_MAX);
      this.ui.hud.setMp(0, PLAYER_MP_MAX);
      this.ui.hud.setZoom(this.viewport.scale.x);

      const prog = this.world.getComponent(this.playerId, 'Progression');
      if (prog) {
        this.ui.hud.setLevel(prog.level);
        this.ui.hud.setXp(prog.xp, prog.xpToNext);
      }
      const inv = this.world.getComponent(this.playerId, 'Inventory');
      if (inv) this.ui.hud.setGold(inv.gold);

      // Camera follow.
      if (pos) this.viewport.moveCenter(pos.x, pos.y);

      // Vision halo flicker (fog zones).
      this.visionHalo?.tick(dt);

      // Hotbar repaint.
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
      const itemsLocked =
        this.world.hasComponent(this.playerId, 'Addition') ||
        this.world.hasComponent(this.playerId, 'Spell') ||
        this.world.hasComponent(this.playerId, 'Defending');
      this.ui.hotbar.setState({
        slots: this.hotbarSlots,
        additionCooldowns,
        itemCounts: inv?.items ?? {},
        itemsLocked,
      });

      // Mob visibility for fog zones (hide out-of-LoS mobs).
      if (this.fog && pos) {
        const grid = worldToGrid(pos.x, pos.y);
        const pgx = Math.round(grid.x);
        const pgy = Math.round(grid.y);
        this.fog.revealCellsAround(pgx, pgy);
        this.fogOverlay?.update(pgx, pgy);
        this.updateMobVisibility(pgx, pgy);
      }

      // Minimap + additions bar repaint.
      if (this.ui.minimap) this.ui.minimap.update(this.world);
      if (this.ui.additionsBar) {
        this.ui.additionsBar.setState({
          unlocked: this.computeUnlockedAdditions(),
          active: this.activeAddition,
          cooldowns: additionCooldowns,
        });
      }

      // Encounter meter indicator — pinned above the player. Fraction
      // comes from the EncounterSystem's accumulator so the pill fills
      // as the player walks.
      if (this.ui.encounterIndicator && this.encounterSystem && pos) {
        this.ui.encounterIndicator.setFill(this.encounterSystem.fraction(), dt);
        this.ui.encounterIndicator.setPosition(pos.x, pos.y - 96);
      }

      // Cursor overlay (desktop story) — swap to the attack sprite when
      // hovering an enemy in click-pick range. Ground-target mode owns
      // the cursor visual (the aoe reticle), so the sword stays default.
      if (this.ui.cursorOverlay) {
        let mode: 'default' | 'attack' = 'default';
        if (
          this.lastMouseWorld &&
          !this.groundTargeting &&
          this.findEnemyAtWorld(this.lastMouseWorld.x, this.lastMouseWorld.y) !== null
        ) {
          mode = 'attack';
        }
        this.ui.cursorOverlay.setMode(mode);
        this.ui.cursorOverlay.update(dt);
      }

      // Inventory panel refresh while open (mirrors live state).
      if (this.ui.inventoryPanel.isOpen) {
        this.ui.inventoryPanel.setState({
          items: inv ? { ...inv.items } : {},
          gold: inv?.gold ?? 0,
          hotbarSlots: this.hotbarSlots,
        });
      }
    }

    // Per-tick scene hooks.
    this.config.hooks?.onTickHUD?.(this.ui.hud, this.ctx);
    if (this.playerId !== null) {
      this.config.hooks?.onTickHotbar?.(this.ui.hotbar, this.world, this.playerId);
    }
  }

  /** Push the live state to the scene's `onPersist` hook (typically a
   *  SaveManager.save). Safe to call repeatedly; no-op when the player
   *  has died (the save was just cleared and we don't want to revive a
   *  doomed state). */
  persist(): void {
    if (this.playerDied) return;
    this.config.hooks?.onPersist?.(this.snapshot());
  }

  destroy(): void {
    this.persist();
    if (this.groundTargeting) this.exitGroundTargeting(false);
    // Halt music so the next scene starts clean. The next scene's
    // playMusic in its enter() handles restart with its own track.
    if (this.config.overrides?.musicAlias) stopMusic();
    this.input.destroy();
    this.ui.destroy();
    this.visionHalo?.destroy();
    this.cleanups.forEach((fn) => fn());
    this.cleanups.length = 0;
    for (const sys of this.systems) {
      const d = sys as { destroy?: () => void };
      d.destroy?.();
    }
    this.ctx.app.stage.removeChild(this.viewport);
    this.viewport.destroy({ children: true });
    this.layers.destroy();
  }

  /** Snapshot for save / persist hooks. */
  snapshot(): GameplaySnapshot {
    let hp = 0;
    let hpMax = 0;
    let gx = 0;
    let gy = 0;
    let inv: Partial<Record<ItemKind, number>> = {};
    let gold = 0;
    let level = 1;
    let xp = 0;
    let xpToNext = 0;
    if (this.playerId !== null) {
      const h = this.world.getComponent(this.playerId, 'Health');
      const p = this.world.getComponent(this.playerId, 'Position');
      const i = this.world.getComponent(this.playerId, 'Inventory');
      const pr = this.world.getComponent(this.playerId, 'Progression');
      if (h) {
        hp = h.current;
        hpMax = h.max;
      }
      if (p) {
        const grid = worldToGrid(p.x, p.y);
        gx = Math.round(grid.x);
        gy = Math.round(grid.y);
      }
      if (i) {
        inv = { ...i.items };
        gold = i.gold;
      }
      if (pr) {
        level = pr.level;
        xp = pr.xp;
        xpToNext = pr.xpToNext;
      }
    }
    return {
      playerHp: hp,
      playerMaxHp: hpMax,
      playerGx: gx,
      playerGy: gy,
      inventory: inv,
      gold,
      hotbarSlots: this.hotbarSlots,
      progressionLevel: level,
      progressionXp: xp,
      progressionXpToNext: xpToNext,
      activeAddition: this.activeAddition,
    };
  }

  // ====================================================================
  // Click pipeline
  // ====================================================================

  private handleClick(cmd: { button: 'left' | 'right'; gx: number; gy: number }): void {
    if (this.playerId === null) return;
    if (this.ui.isPaused()) return;
    if (this.groundTargeting) {
      this.exitGroundTargeting(cmd.button === 'left');
      return;
    }
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
        this.manualCombatLockUntilMs = performance.now() + MANUAL_COMBAT_LOCK_MS;
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
  }

  private handleDefendChange(active: boolean): void {
    if (this.playerId === null) return;
    if (active) {
      if (
        this.world.hasComponent(this.playerId, 'Addition') ||
        this.world.hasComponent(this.playerId, 'Spell')
      ) {
        this.input.emitDefend(false);
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
  }

  // ====================================================================
  // Combat helpers
  // ====================================================================

  private findEnemyAtCell(gx: number, gy: number): Entity | null {
    const target = gridToWorld(gx, gy);
    return this.findEnemyAtWorld(target.x, target.y);
  }

  private findEnemyAtWorld(wx: number, wy: number): Entity | null {
    let best: Entity | null = null;
    let bestDist = ENEMY_PICK_RADIUS_PX;
    for (const id of this.world.query(['Faction', 'Position', 'Health'])) {
      if (this.world.hasComponent(id, 'Dying')) continue;
      if (this.world.hasComponent(id, 'Hidden')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      const pos = this.world.getComponent(id, 'Position');
      const hp = this.world.getComponent(id, 'Health');
      if (!fac || !pos || !hp || fac.side === 'player' || hp.current <= 0) continue;
      const d = Math.hypot(pos.x - wx, pos.y - wy);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    return best;
  }

  /** Range-agnostic target picker for spell items — see ForestScene
   *  for the original rationale (always cast on the active CombatIntent
   *  target, fall back to nearest visible enemy). */
  private pickSpellTarget(px: number, py: number): Entity | null {
    if (this.playerId === null) return null;
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

  /** Range-bounded target picker for additions (explicitly limited
   *  skills). Prefers the current CombatIntent if it's still in range. */
  private pickAdditionTarget(px: number, py: number, range: number): Entity | null {
    if (this.playerId === null) return null;
    const intent = this.world.getComponent(this.playerId, 'CombatIntent');
    if (intent !== undefined) {
      const tp = this.world.getComponent(intent.targetId, 'Position');
      const th = this.world.getComponent(intent.targetId, 'Health');
      if (
        tp &&
        th &&
        th.current > 0 &&
        !this.world.hasComponent(intent.targetId, 'Dying') &&
        Math.hypot(tp.x - px, tp.y - py) <= range
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
      const tp = this.world.getComponent(id, 'Position');
      if (!tp) continue;
      const d = Math.hypot(tp.x - px, tp.y - py);
      if (d <= range && d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    }
    return bestId;
  }

  private tryTriggerAddition(kind: AdditionKind): void {
    if (this.playerId === null) return;
    if (this.world.hasComponent(this.playerId, 'Addition')) return;
    if (this.world.hasComponent(this.playerId, 'Spell')) return;
    if (this.world.hasComponent(this.playerId, 'Defending')) return;
    const def = ADDITIONS[kind];
    if (!def) return;
    const cd = this.world.getComponent(this.playerId, 'SkillCooldown');
    if (cd && (cd.remainingMs[kind] ?? 0) > 0) {
      this.ui.toast.show(t('addition.cooldown'));
      return;
    }
    const stats = this.world.getComponent(this.playerId, 'Stats');
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!stats || !pos) return;
    const target = this.pickAdditionTarget(pos.x, pos.y, stats.range);
    if (target === null) {
      this.ui.toast.show(t('addition.noTarget'));
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

  private computeActiveAdditionCdFrac(): number {
    if (this.playerId === null) return 0;
    const cd = this.world.getComponent(this.playerId, 'SkillCooldown');
    if (!cd) return 0;
    const remaining = cd.remainingMs[this.activeAddition] ?? 0;
    const total = ADDITIONS[this.activeAddition]?.cooldownMs ?? 0;
    if (remaining <= 0 || total <= 0) return 0;
    return Math.min(1, remaining / total);
  }

  // ====================================================================
  // Items + hotbar
  // ====================================================================

  private tryConsumeItem(kind: ItemKind): void {
    if (this.playerId === null) return;
    if (this.playerDied) return;
    if (this.ui.settings.isOpen) return;
    if (
      this.world.hasComponent(this.playerId, 'Addition') ||
      this.world.hasComponent(this.playerId, 'Spell') ||
      this.world.hasComponent(this.playerId, 'Defending')
    ) {
      this.ui.toast.show(t('inventory.busy'));
      return;
    }
    if (this.world.hasComponent(this.playerId, 'Dying')) return;

    const inv = this.world.getComponent(this.playerId, 'Inventory');
    if (!inv) return;
    const count = inv.items[kind] ?? 0;
    if (count <= 0) {
      this.ui.toast.show(t('inventory.empty'));
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
        this.ui.toast.show(t('inventory.empty'));
        return;
      }
      hp.current += healed;
      this.decrementItem(inv, kind);
      spawnFloatingText(this.world, {
        x: pos.x,
        y: pos.y,
        text: `+${healed}`,
        color: FLOAT_HEAL,
      });
      playSfx('items.pickup');
      return;
    }
    if (use.kind === 'spell') {
      this.startSpellFromItem(kind, use.spell);
    }
  }

  private startSpellFromItem(itemKind: ItemKind, spellKind: SpellKind): void {
    if (this.playerId === null) return;
    const spell = SPELLS[spellKind];
    const stats = this.world.getComponent(this.playerId, 'Stats');
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!stats || !pos) return;

    if (spell.target === 'lockedTarget') {
      const targetId = this.pickSpellTarget(pos.x, pos.y);
      if (targetId === null) {
        this.ui.toast.show(t('inventory.noTarget'));
        return;
      }
      const tp = this.world.getComponent(targetId, 'Position');
      if (!tp) return;
      const dx = tp.x - pos.x;
      const dy = tp.y - pos.y;
      const len = Math.hypot(dx, dy) || 1;
      this.world.addComponent(this.playerId, 'Spell', {
        kind: spellKind,
        elapsedMs: 0,
        totalMs: spell.totalMs,
        hitTimingMs: spell.hitTimingMs,
        hitApplied: false,
        magicAtkMul: spell.magicAtkMul,
        target: 'lockedTarget',
        targetId,
        dirX: dx / len,
        dirY: dy / len,
        vfxKind: spell.vfx,
        vfxRadiusPx: spell.vfxRadiusPx ?? 60,
      });
      const inv = this.world.getComponent(this.playerId, 'Inventory');
      if (inv) this.decrementItem(inv, itemKind);
      const pf = this.world.getComponent(this.playerId, 'Pathfinder');
      if (pf) {
        pf.waypoints = null;
        pf.targetGrid = null;
      }
      playSfx('combat.swing');
      return;
    }

    // groundAoE — auto-target current combat / nearest visible enemy.
    const aoeSpell = spell;
    const lockOn = this.pickSpellTarget(pos.x, pos.y);
    if (lockOn !== null) {
      const tp = this.world.getComponent(lockOn, 'Position');
      if (tp) {
        const dx = tp.x - pos.x;
        const dy = tp.y - pos.y;
        const len = Math.hypot(dx, dy) || 1;
        this.world.addComponent(this.playerId, 'Spell', {
          kind: spellKind,
          elapsedMs: 0,
          totalMs: aoeSpell.totalMs,
          hitTimingMs: aoeSpell.hitTimingMs,
          hitApplied: false,
          magicAtkMul: aoeSpell.magicAtkMul,
          target: 'groundAoE',
          targetX: tp.x,
          targetY: tp.y,
          aoeRadiusPx: aoeSpell.aoeRadiusPx,
          dirX: dx / len,
          dirY: dy / len,
          vfxKind: aoeSpell.vfx,
          vfxRadiusPx: aoeSpell.vfxRadiusPx ?? aoeSpell.aoeRadiusPx,
        });
        const inv = this.world.getComponent(this.playerId, 'Inventory');
        if (inv) this.decrementItem(inv, itemKind);
        const pf = this.world.getComponent(this.playerId, 'Pathfinder');
        if (pf) {
          pf.waypoints = null;
          pf.targetGrid = null;
        }
        playSfx('combat.swing');
        return;
      }
    }
    // No target available — fall back to manual ground-targeting. The
    // player clicks anywhere within castRangePx to commit; right-click
    // or Esc cancels without consuming the item.
    this.enterGroundTargeting(itemKind, spellKind);
  }

  private decrementItem(inv: { items: Partial<Record<ItemKind, number>> }, kind: ItemKind): void {
    const c = inv.items[kind] ?? 0;
    if (c > 0) inv.items[kind] = c - 1;
  }

  /**
   * Enter ground-targeting mode for an AoE spell. Spawns a translucent
   * preview circle on the fx layer, attaches pointermove/Esc listeners.
   * The click handler in the main input route picks up commit/cancel via
   * the `groundTargeting` state.
   */
  private enterGroundTargeting(itemKind: ItemKind, spellKind: SpellKind): void {
    if (this.playerId === null) return;
    if (this.groundTargeting) this.exitGroundTargeting(false);
    const spellDef = SPELLS[spellKind];
    if (spellDef.target !== 'groundAoE') return;
    const playerPos = this.world.getComponent(this.playerId, 'Position');
    if (!playerPos) return;

    const cursor = new Graphics()
      .circle(0, 0, spellDef.aoeRadiusPx)
      .fill({ color: 0xff4040, alpha: 0.18 })
      .stroke({ color: 0xff6060, width: 2, alpha: 0.85 });
    cursor.position.set(playerPos.x, playerPos.y);
    this.layers.fx.addChild(cursor);

    const viewport = this.viewport;
    const onMove = (e: FederatedPointerEvent): void => {
      if (!this.groundTargeting || this.playerId === null) return;
      const playerNow = this.world.getComponent(this.playerId, 'Position');
      if (!playerNow) return;
      const local = viewport.toWorld(e.global);
      const dx = local.x - playerNow.x;
      const dy = local.y - playerNow.y;
      const dist = Math.hypot(dx, dy);
      const range = this.groundTargeting.castRangePx;
      if (dist > range) {
        const k = range / dist;
        cursor.position.set(playerNow.x + dx * k, playerNow.y + dy * k);
      } else {
        cursor.position.set(local.x, local.y);
      }
    };
    viewport.on('pointermove', onMove);

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && this.groundTargeting) this.exitGroundTargeting(false);
    };
    window.addEventListener('keydown', onKey);

    this.groundTargeting = {
      spell: spellKind,
      itemKind,
      aoeRadiusPx: spellDef.aoeRadiusPx,
      castRangePx: spellDef.castRangePx,
      cursor,
      cleanups: [
        () => viewport.off('pointermove', onMove),
        () => window.removeEventListener('keydown', onKey),
      ],
    };
  }

  private exitGroundTargeting(commit: boolean): void {
    const gt = this.groundTargeting;
    if (!gt) return;
    this.groundTargeting = null;
    gt.cleanups.forEach((fn) => fn());
    const cursorX = gt.cursor.x;
    const cursorY = gt.cursor.y;
    gt.cursor.destroy();

    if (!commit || this.playerId === null) return;
    const playerPos = this.world.getComponent(this.playerId, 'Position');
    const inv = this.world.getComponent(this.playerId, 'Inventory');
    if (!playerPos || !inv) return;
    if ((inv.items[gt.itemKind] ?? 0) <= 0) return;
    const spellDef = SPELLS[gt.spell];
    if (spellDef.target !== 'groundAoE') return;

    const dx = cursorX - playerPos.x;
    const dy = cursorY - playerPos.y;
    const len = Math.hypot(dx, dy) || 1;
    this.world.addComponent(this.playerId, 'Spell', {
      kind: gt.spell,
      elapsedMs: 0,
      totalMs: spellDef.totalMs,
      hitTimingMs: spellDef.hitTimingMs,
      hitApplied: false,
      magicAtkMul: spellDef.magicAtkMul,
      target: 'groundAoE',
      targetX: cursorX,
      targetY: cursorY,
      aoeRadiusPx: gt.aoeRadiusPx,
      dirX: dx / len,
      dirY: dy / len,
      vfxKind: spellDef.vfx,
      vfxRadiusPx: spellDef.vfxRadiusPx ?? gt.aoeRadiusPx,
    });
    this.decrementItem(inv, gt.itemKind);
    const pf = this.world.getComponent(this.playerId, 'Pathfinder');
    if (pf) {
      pf.waypoints = null;
      pf.targetGrid = null;
    }
    playSfx('combat.swing');
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
    if (this.ui.inventoryPanel.isOpen) {
      const sel = this.ui.inventoryPanel.getSelectedKind();
      if (sel) this.bindItemToHotbar(sel, slotIdx);
      return;
    }
    const slot = this.hotbarSlots[slotIdx] ?? null;
    if (!slot) return;
    if (slot.kind === 'addition') this.tryTriggerAddition(slot.addition);
    else if (slot.kind === 'item') this.tryConsumeItem(slot.item);
  }

  private openInventoryPanel(): void {
    if (this.playerId === null) return;
    const inv = this.world.getComponent(this.playerId, 'Inventory');
    const state: InventoryPanelState = {
      items: inv ? { ...inv.items } : {},
      gold: inv?.gold ?? 0,
      hotbarSlots: this.hotbarSlots,
    };
    this.ui.inventoryPanel.open(state);
  }

  private openAdditionsPicker(): void {
    if (!this.ui.additionsPicker) return;
    if (this.groundTargeting) this.exitGroundTargeting(false);
    this.ui.additionsPicker.open(this.computeUnlockedAdditions(), this.activeAddition, (kind) => {
      this.activeAddition = kind;
    });
  }

  /** Resolve the addition unlock pool via the scene hook, falling back to
   *  `[active]` so the picker is never empty. */
  private computeUnlockedAdditions(): ReadonlyArray<AdditionKind> {
    const hook = this.config.hooks?.unlockedAdditions;
    if (!hook || this.playerId === null) return [this.activeAddition];
    const prog = this.world.getComponent(this.playerId, 'Progression');
    return hook(prog?.level ?? 1);
  }

  // ====================================================================
  // Touch + joystick
  // ====================================================================

  private touchAttackNearest(): void {
    if (this.playerId === null) return;
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

  private pollJoystickMove(): void {
    const joystick = this.ui.virtualJoystick;
    if (!joystick || this.playerId === null) return;
    if (!joystick.isHeld()) {
      if (this.joystickDriven) {
        this.joystickDriven = false;
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
    const dir = joystick.direction();
    if (!dir) return; // finger held inside dead zone
    const now = performance.now();
    if (now - this.joystickEmitMs < JOYSTICK_THROTTLE_MS) return;
    if (now < this.manualCombatLockUntilMs) return;
    this.joystickEmitMs = now;
    this.joystickDriven = true;
    const pos = this.world.getComponent(this.playerId, 'Position');
    if (!pos) return;
    const tileDiag = Math.sqrt(64 * 64 + 32 * 32);
    const targetWx = pos.x + dir.x * JOYSTICK_PROJECTION_TILES * tileDiag;
    const targetWy = pos.y + dir.y * JOYSTICK_PROJECTION_TILES * tileDiag;
    const grid = worldToGrid(targetWx, targetWy);
    this.input.emitClick({
      button: 'left',
      gx: Math.round(grid.x),
      gy: Math.round(grid.y),
    });
  }

  // ====================================================================
  // Fog
  // ====================================================================

  private updateMobVisibility(playerGx: number, playerGy: number): void {
    if (!this.fog) return;
    for (const id of this.world.query(['Faction', 'Position'])) {
      const fac = this.world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const pos = this.world.getComponent(id, 'Position');
      if (!pos) continue;
      const grid = worldToGrid(pos.x, pos.y);
      const mgx = Math.round(grid.x);
      const mgy = Math.round(grid.y);
      const visible = this.fog.isCurrentlyVisible(mgx, mgy, playerGx, playerGy);
      if (visible) {
        this.world.removeComponent(id, 'Hidden');
      } else {
        this.world.addComponent(id, 'Hidden', {});
      }
    }
  }
}

/** Re-export so consumers don't need to chase the type from MapLoader. */
export type { MapData };
