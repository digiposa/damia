/**
 * Training mode — dev / debug sandbox. Loads the arena map (same one
 * Survival uses) but skips all the survival-specific machinery: no
 * wave spawner, no run timer, no level-up choice modal, no save / run
 * record, no game-over routing. On player death we simply respawn
 * them in place so the tester can keep poking at numbers without
 * being kicked back to the title.
 *
 * Everything tweakable lives in `TrainingDebugPanel` — character
 * switcher, level setter, mob spawner, full heal, kill-all — so the
 * scene itself is intentionally bare.
 *
 * Not intended to ship to end users as-is. Kept on a separate code
 * path from Survival so production scenes don't have to bake in
 * "if debug mode" branches.
 */
import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import { TitleScene } from '../TitleScene';
import { MODE_TUNING } from '@data/mode';
import { ADDITIONS, type AdditionKind, type MobKind } from '@data/balance';
import { DART, type CharacterAvatar } from '@data/characters';
import { spawnPlayer } from '@gameplay/entities/player';
import { spawnMob } from '@gameplay/entities/mobs';
import { xpToReachLevel } from '@data/characters';
import { applyLevelStats } from '@gameplay/stats';
import { worldToGrid } from '@core/math/iso';
import { TrainingDebugPanel } from '@ui/TrainingDebugPanel';

const ARENA_SIZE = 11;
const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
const SPAWN_GY = Math.floor(ARENA_SIZE / 2);

function buildArenaMap(): MapData {
  return {
    name: 'arena',
    size: { w: ARENA_SIZE, h: ARENA_SIZE },
    spawn: { gx: SPAWN_GX, gy: SPAWN_GY },
    pathZones: [{ x: 0, y: 0, w: ARENA_SIZE, h: ARENA_SIZE }],
    props: [],
    exits: [],
    mobs: [],
    interactables: [],
  };
}

export class TrainingScene implements Scene {
  readonly name = 'training';
  private controller: GameplayController | null = null;
  private debugPanel: TrainingDebugPanel | null = null;
  private avatar: CharacterAvatar = DART;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  enter(ctx: GameContext): void {
    const config: SceneConfig = {
      mode: 'survival',
      map: buildArenaMap(),
      character: this.avatar,
      overrides: {
        cameraZoom: MODE_TUNING.survival.cameraZoom,
        enablePan: false,
        enableFogOfWar: false,
        enableEncounters: false,
        showZoneTitle: false,
        showMiniMap: false,
        showActionLog: false,
        showAdditionsBar: true,
        // Training-specific desert ruins backdrop (1440×720 native,
        // 2:1 iso ratio matches ARENA_SIZE = 11).
        prerenderedMapAsset: 'map.training.arena',
        // Dragoon always available — this is a sandbox, every form
        // should be testable from second 0.
        dragoonStartUnlocked: true,
        showEncounterIndicator: false,
        musicAlias: 'music.forestAmbient',
      },
      // Generous starter inventory so every spell / heal flow is one
      // hotbar tap away while testing.
      prefilledInventory: {
        healingPotion: 99,
        burnOut: 99,
        gushingMagma: 99,
      },
      prefilledHotbar: [
        { kind: 'item', item: 'healingPotion' },
        { kind: 'item', item: 'burnOut' },
        { kind: 'item', item: 'gushingMagma' },
        null,
        null,
        null,
      ],
      hooks: {
        unlockedAdditions: (level) => this.unlockedAdditions(level),
        onPlayerDeath: () => {
          // No game-over routing — respawn in place so the tester can
          // keep iterating. Wrapped in queueMicrotask so we don't
          // mutate the world mid-DeathSystem pass.
          queueMicrotask(() => this.respawnCurrentCharacter());
        },
        onQuit: () => {
          void ctx.scenes.switchTo(new TitleScene(), ctx);
        },
      },
    };
    this.controller = new GameplayController(ctx, config);

    // Debug overlay — owns the character / level / mob spawn controls.
    this.debugPanel = new TrainingDebugPanel(ctx.app, {
      getCurrentAvatar: () => this.avatar,
      setCharacter: (avatar) => this.switchCharacter(avatar),
      setLevel: (level) => this.setPlayerLevel(level),
      spawnMob: (kind, count) => this.spawnMobBatch(kind, count),
      healPlayer: () => this.healPlayerFull(),
      killAllMobs: () => this.killAllMobs(),
      getPlayerLevel: () => this.getPlayerLevel(),
      onQuit: () => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      },
    });
    this.controller.layers.ui.addChild(this.debugPanel.container);
    // Mount the floating "DBG" toggle button alongside the modal so
    // it's visible from the first frame — without this the panel can
    // only be reached via the `~` keyboard shortcut, which is a
    // non-starter on mobile and easy to miss on desktop.
    this.debugPanel.mountToggleButton(this.controller.layers.ui);

    // Keyboard shortcuts. Esc closes the debug panel when it's open
    // (intercepted in the capture phase so SettingsPanel's window-level
    // Esc handler — which would otherwise open Settings on top of the
    // debug panel — doesn't fire). `W` toggles the debug panel both
    // ways as a secondary entry alongside the DBG corner button;
    // chosen because it's a single physical key reachable on every
    // keyboard layout (the previous `~` binding was a multi-key
    // chord on Belgian / French AZERTY layouts).
    this.keyHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && this.debugPanel?.isOpen) {
        e.stopImmediatePropagation();
        e.preventDefault();
        this.debugPanel.close();
        return;
      }
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.debugPanel?.toggle();
      }
    };
    window.addEventListener('keydown', this.keyHandler, true);
  }

  exit(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = null;
    }
    this.debugPanel?.destroy();
    this.debugPanel = null;
    this.controller?.destroy();
    this.controller = null;
  }

  update(dt: number): void {
    // Hard pause while the DBG panel owns the screen — same pattern
    // ArenaScene uses for its level-up modal. Skipping the entire
    // controller update freezes the ECS world (no AI ticks, no
    // combat, no animations) so the tester can edit a level / swap
    // a character without the mob walking off-screen mid-tweak.
    if (this.debugPanel?.isOpen) return;
    this.controller?.update(dt);
  }

  // ---- Debug actions -----------------------------------------------

  /** Tear down the current player entity and spawn a fresh one with
   *  the new avatar at the spawn point. Inventory + hotbar reset to
   *  the training defaults so the swap is clean. */
  private switchCharacter(avatar: CharacterAvatar): void {
    this.avatar = avatar;
    this.respawnCurrentCharacter();
  }

  private respawnCurrentCharacter(): void {
    const controller = this.controller;
    if (!controller) return;
    const world = controller.world;
    let gx = SPAWN_GX;
    let gy = SPAWN_GY;
    // Reuse the previous player's grid cell so the camera doesn't
    // jump on character swap. Fall back to map spawn if no live
    // entity (e.g. fresh enter).
    if (controller.playerId !== null) {
      const prevPos = world.getComponent(controller.playerId, 'Position');
      if (prevPos) {
        const cell = worldToGrid(prevPos.x, prevPos.y);
        gx = Math.round(cell.x);
        gy = Math.round(cell.y);
      }
      world.destroyEntity(controller.playerId);
    }
    controller.playerId = spawnPlayer(world, {
      avatar: this.avatar,
      gx,
      gy,
      dragoonUnlocked: true,
    });
  }

  /** Force the player to a specific level. No XP gain in this mode —
   *  the slider is the only way to change level. Stats / HP reset
   *  delegated to the shared `applyLevelStats` helper so this stays
   *  in lockstep with DeathSystem.awardXp + ForestScene.applyDartRow. */
  private setPlayerLevel(level: number): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerId = controller.playerId;
    const prog = world.getComponent(playerId, 'Progression');
    const character = world.getComponent(playerId, 'Character');
    if (!prog || !character) return;
    const archetype = character.avatar.archetype;
    const cap = archetype.statsByLevel.length;
    const clamped = Math.max(1, Math.min(cap, Math.round(level)));
    prog.level = clamped;
    prog.xp = xpToReachLevel(archetype, clamped);
    prog.xpToNext = xpToReachLevel(archetype, clamped + 1);
    applyLevelStats(world, playerId, clamped);
  }

  private getPlayerLevel(): number {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return 1;
    return controller.world.getComponent(controller.playerId, 'Progression')?.level ?? 1;
  }

  /** Spawn `count` copies of `kind` around the player. Ring formation
   *  ~3 tiles out, evenly spaced — easy on the eye + same engagement
   *  range for every spawn. */
  private spawnMobBatch(kind: MobKind, count: number): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerPos = world.getComponent(controller.playerId, 'Position');
    if (!playerPos) return;
    const playerGrid = worldToGrid(playerPos.x, playerPos.y);
    const ringRadius = 3;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const gx = Math.max(
        0,
        Math.min(ARENA_SIZE - 1, Math.round(playerGrid.x + ringRadius * Math.cos(angle))),
      );
      const gy = Math.max(
        0,
        Math.min(ARENA_SIZE - 1, Math.round(playerGrid.y + ringRadius * Math.sin(angle))),
      );
      const entity = spawnMob(world, kind, gx, gy);
      controller.mobKinds.set(entity, kind);
    }
  }

  private healPlayerFull(): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const hp = world.getComponent(controller.playerId, 'Health');
    if (hp) hp.current = hp.max;
    // SP not reset — keeping it cheap to test Dragoon mode by mashing
    // a few additions then transforming.
  }

  private killAllMobs(): void {
    const controller = this.controller;
    if (!controller) return;
    const world = controller.world;
    for (const id of world.query(['Health', 'Faction'])) {
      const fac = world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const h = world.getComponent(id, 'Health');
      if (h) h.current = 0;
    }
  }

  // ---- Helpers shared with ArenaScene ------------------------------

  private unlockedAdditions(level: number): ReadonlyArray<AdditionKind> {
    const archetype = this.avatar.archetype;
    const out: AdditionKind[] = [];
    for (const [unlockLv, kind] of archetype.additionUnlocksByLevel) {
      if (level < unlockLv) continue;
      if (kind in ADDITIONS) out.push(kind as AdditionKind);
    }
    return out;
  }
}
