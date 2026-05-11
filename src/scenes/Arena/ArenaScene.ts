import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import { TitleScene } from '../TitleScene';
import { GameOverScene } from '../GameOverScene';
import { RunState } from '@/store/RunState';
import { MODE_TUNING } from '@data/mode';

const ARENA_SIZE = 28;
const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
const SPAWN_GY = Math.floor(ARENA_SIZE / 2);

/** Flat 28×28 arena with a placeholder mob ring around the centre.
 *  Replaced by the `WaveSpawnerSystem` once that ships — for now the
 *  ring is just enough mobs to test combat. */
function buildArenaMap(): MapData {
  return {
    name: 'arena',
    size: { w: ARENA_SIZE, h: ARENA_SIZE },
    spawn: { gx: SPAWN_GX, gy: SPAWN_GY },
    pathZones: [{ x: 0, y: 0, w: ARENA_SIZE, h: ARENA_SIZE }],
    props: [],
    exits: [],
    mobs: [
      { kind: 'berserkMouse', gx: SPAWN_GX - 5, gy: SPAWN_GY - 4 },
      { kind: 'goblin', gx: SPAWN_GX + 5, gy: SPAWN_GY - 4 },
      { kind: 'berserkMouse', gx: SPAWN_GX - 5, gy: SPAWN_GY + 4 },
      { kind: 'goblin', gx: SPAWN_GX + 5, gy: SPAWN_GY + 4 },
    ],
    interactables: [],
  };
}

/**
 * Survival arena. Reuses the full gameplay pipeline from
 * `GameplayController` — only mode-specific bits live here:
 *
 *  - `RunState` tracks elapsed run time + kills + run level.
 *  - HUD's level / xp slots are hijacked to surface kills + run level
 *    until the dedicated survival HUD overlay lands.
 *  - Death routes to `GameOverScene('survival')` so the restart button
 *    spawns a fresh arena instead of dropping the player into Forest.
 *
 * Wave spawning + level-up choices + run summary land in subsequent
 * commits; this scene is the lightest possible shell that proves the
 * controller works end-to-end with `mode: 'survival'`.
 */
export class ArenaScene implements Scene {
  readonly name = 'arena';
  private controller: GameplayController | null = null;
  private readonly runState = new RunState();

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
        onTickHUD: (hud) => {
          // Surface run stats in the level / XP slots until the
          // dedicated survival HUD ships.
          const snap = this.runState.read();
          hud.setLevel(snap.level);
          hud.setXp(snap.kills, 0);
        },
      },
    };
    this.controller = new GameplayController(ctx, config);
  }

  exit(ctx: GameContext): void {
    this.controller?.destroy();
    this.controller = null;
    // Silence "unused" until the controller's exit needs ctx (it doesn't
    // today — destroy handles teardown internally).
    void ctx;
  }

  update(dt: number): void {
    this.controller?.update(dt);
    this.runState.tick(dt);
  }
}
