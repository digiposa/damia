import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import { TitleScene } from '../TitleScene';
import { GameOverScene } from '../GameOverScene';
import { RunState } from '@/store/RunState';
import { MODE_TUNING } from '@data/mode';
import { MOBS } from '@data/balance';
import { WaveSpawnerSystem } from '@gameplay/systems/WaveSpawnerSystem';
import { ARENA_MIN_SPAWN_DIST_PX, ARENA_WAVE_DURATION_MS, buildArenaWave } from '@data/arenaWaves';
import { SurvivalHUD } from '@ui/SurvivalHUD';

const ARENA_SIZE = 28;
const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
const SPAWN_GY = Math.floor(ARENA_SIZE / 2);

/** Flat 28×28 arena with no pre-placed mobs — every enemy in Survival
 *  comes from `WaveSpawnerSystem` so the difficulty curve stays in one
 *  place (data/arenaWaves.ts). */
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

/**
 * Survival arena. Reuses the full gameplay pipeline from
 * `GameplayController` — only mode-specific bits live here:
 *
 *  - `RunState` tracks elapsed run time + kills + per-run level / XP
 *    (independent of the player entity's `Progression` component, which
 *    is Story-only).
 *  - `WaveSpawnerSystem` ticks alongside the controller, spawning mobs
 *    on the arena edges in waves of rising difficulty. Endless: the
 *    `buildArenaWave(idx)` curve never plateaus.
 *  - HUD's level / XP slots are temporarily hijacked to surface kills +
 *    run level until the dedicated SurvivalHUD overlay ships.
 *  - Death routes to `GameOverScene('survival')` so restart spawns a
 *    fresh arena instead of dropping the player into Forest.
 */
export class ArenaScene implements Scene {
  readonly name = 'arena';
  private controller: GameplayController | null = null;
  private readonly runState = new RunState();
  private waveSpawner: WaveSpawnerSystem | null = null;
  private survivalHud: SurvivalHUD | null = null;

  enter(ctx: GameContext): void {
    const config: SceneConfig = {
      mode: 'survival',
      map: buildArenaMap(),
      overrides: {
        cameraZoom: MODE_TUNING.survival.cameraZoom,
        enablePan: false,
        enableFogOfWar: false,
        enableEncounters: false,
        showZoneTitle: false,
        showMiniMap: false,
        showActionLog: false,
        showAdditionsBar: false,
        showEncounterIndicator: false,
        musicAlias: 'music.forestAmbient',
        // Survival runs its own XP curve through `RunState`. Disable the
        // Story-side Progression bump so the player isn't mid-run healed
        // to full and given Dart's TLoD stat row each time the cumulative
        // XP crosses a Story threshold (LV 2 hits at just 20 XP).
        awardPlayerXp: false,
      },
      // Dev loadout so the spell / heal flow is testable without
      // loot drops. TODO: remove once level-up rewards exist.
      prefilledInventory: {
        healingPotion: 5,
        burnOut: 3,
        gushingMagma: 2,
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
        onPlayerDeath: () => {
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new GameOverScene('survival'), ctx);
          });
        },
        onQuit: () => {
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new TitleScene(), ctx);
          });
        },
        onMobDeath: (kind) => {
          // Survival's per-run progression: count + per-mob XP.
          this.runState.recordKill(MOBS[kind].xp);
        },
        onTickHUD: (hud) => {
          // Surface run progression in the level + XP slots until the
          // dedicated SurvivalHUD overlay ships. Showing kills here was
          // misleading: the bar maxed at 0 so the player couldn't see
          // real progress toward the next level-up.
          const snap = this.runState.read();
          hud.setLevel(snap.level);
          hud.setXp(snap.xp, this.runState.xpToNext);
        },
      },
    };
    this.controller = new GameplayController(ctx, config);

    // Wave director — ticks outside the controller's ECS pipeline so
    // survival-only logic stays out of the shared engine. Reads the
    // controller's player + mob registry through closures.
    const controller = this.controller;
    this.waveSpawner = new WaveSpawnerSystem({
      waveDurationMs: ARENA_WAVE_DURATION_MS,
      buildWave: (idx) => buildArenaWave(idx),
      arenaSize: { width: ARENA_SIZE, height: ARENA_SIZE },
      // Arena has no obstacles; every in-bounds cell is walkable.
      isWalkable: () => true,
      getPlayerEntity: () => controller.playerId,
      minPlayerDistPx: ARENA_MIN_SPAWN_DIST_PX,
      onSpawn: (entity, kind) => {
        controller.mobKinds.set(entity, kind);
      },
    });

    // Top-center timer + wave + kills strip. Mounted on the shared UI
    // layer so it auto-rides through controller resize/teardown without
    // extra wiring.
    this.survivalHud = new SurvivalHUD(ctx.app);
    controller.layers.ui.addChild(this.survivalHud.container);
  }

  exit(ctx: GameContext): void {
    // Destroy the HUD before the controller so its Pixi container isn't
    // mid-teardown when layers.destroy() cascades.
    this.survivalHud?.destroy();
    this.survivalHud = null;
    this.controller?.destroy();
    this.controller = null;
    this.waveSpawner = null;
    void ctx;
  }

  update(dt: number): void {
    this.controller?.update(dt);
    // Pause the run timer + wave drip when a modal owns input — same
    // gate the controller uses for its ECS pipeline.
    if (this.controller?.ui.isPaused()) return;
    this.runState.tick(dt);
    if (this.controller && this.waveSpawner) {
      this.waveSpawner.update(dt, this.controller.world);
    }
    if (this.survivalHud && this.waveSpawner) {
      const snap = this.runState.read();
      this.survivalHud.setState({
        elapsedMs: snap.elapsedMs,
        // currentWave is 0-based internally; +1 for the player-facing
        // count (Vague 1, 2, 3 …). Clamp at 1 during the pre-spawn
        // grace tick so the HUD never reads "Vague 0".
        wave: Math.max(1, this.waveSpawner.currentWave + 1),
        kills: snap.kills,
      });
    }
  }
}
