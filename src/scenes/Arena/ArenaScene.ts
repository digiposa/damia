import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import { TitleScene } from '../TitleScene';
import { RunSummaryScene } from '../RunSummaryScene';
import { RunState } from '@/store/RunState';
import { MODE_TUNING } from '@data/mode';
import { MOBS } from '@data/balance';
import { WaveSpawnerSystem } from '@gameplay/systems/WaveSpawnerSystem';
import { ARENA_MIN_SPAWN_DIST_PX, ARENA_WAVE_DURATION_MS, buildArenaWave } from '@data/arenaWaves';
import { SurvivalHUD } from '@ui/SurvivalHUD';
import { LevelUpChoiceModal } from '@ui/LevelUpChoiceModal';
import { UPGRADES, rollUpgradeChoices, type UpgradeKind } from '@data/upgrades';
import { DART, type CharacterDef } from '@data/characters';

const ARENA_SIZE = 28;
const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
const SPAWN_GY = Math.floor(ARENA_SIZE / 2);
const UPGRADE_PICKS_PER_LEVELUP = 3;

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
 *  - `RunState` tracks per-run telemetry (elapsed time + kills) for the
 *    SurvivalHUD overlay + RunSummaryScene.
 *  - `WaveSpawnerSystem` ticks alongside the controller, spawning mobs
 *    on the arena edges in waves of rising difficulty.
 *  - `LevelUpChoiceModal` opens on every player level-up: pause the
 *    simulation, present 3 upgrade picks, apply the chosen bonus +
 *    record it in `runUpgrades` so the same bonus can be re-applied on
 *    every subsequent level-up (otherwise the Dart-row reset in
 *    `DeathSystem.awardXp` would wipe ATK/DEF/MAT/MDF/HP-max picks).
 *  - Death routes to `RunSummaryScene` with the snapshotted run stats.
 */
export class ArenaScene implements Scene {
  readonly name = 'arena';
  private controller: GameplayController | null = null;
  private readonly runState = new RunState();
  private waveSpawner: WaveSpawnerSystem | null = null;
  private survivalHud: SurvivalHUD | null = null;
  private levelUpModal: LevelUpChoiceModal | null = null;
  /** Character to spawn. Picked by the CharacterSelectScene; defaults
   *  to Dart for the legacy entry path where the title screen jumps
   *  straight in (rare now that the selector exists). */
  private readonly character: CharacterDef;
  /** Upgrades picked during this run, in pick order. Re-applied (the
   *  non-oneShot ones) on every subsequent level-up so stat bumps
   *  survive the Dart-row reset that DeathSystem performs. */
  private readonly runUpgrades: UpgradeKind[] = [];
  /** Level-ups awaiting a modal pick. Drained one at a time by
   *  `update()` so multi-level XP gains chain pickers cleanly. */
  private pendingChoices = 0;

  constructor(character: CharacterDef = DART) {
    this.character = character;
  }

  /** Read by RunSummaryScene + future RunHighScores entries so the
   *  picked character travels with the run record. */
  getCharacter(): CharacterDef {
    return this.character;
  }

  enter(ctx: GameContext): void {
    const config: SceneConfig = {
      mode: 'survival',
      map: buildArenaMap(),
      character: this.character,
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
          const summary = this.snapshotRun();
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new RunSummaryScene(summary), ctx);
          });
        },
        onQuit: () => {
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new TitleScene(), ctx);
          });
        },
        onMobDeath: (kind) => {
          this.runState.recordKill(MOBS[kind].xp);
        },
        onPlayerLevelUp: () => {
          // DeathSystem has already overwritten the player's stats with
          // Dart's canonical row at the new level + healed to full.
          // Re-apply every accumulated upgrade that's NOT one-shot so
          // the bonuses survive the reset, then queue the modal for
          // the new pick.
          this.reapplyStackedUpgrades();
          this.pendingChoices += 1;
        },
      },
    };
    this.controller = new GameplayController(ctx, config);

    const controller = this.controller;
    this.waveSpawner = new WaveSpawnerSystem({
      waveDurationMs: ARENA_WAVE_DURATION_MS,
      buildWave: (idx) => buildArenaWave(idx),
      arenaSize: { width: ARENA_SIZE, height: ARENA_SIZE },
      isWalkable: () => true,
      getPlayerEntity: () => controller.playerId,
      minPlayerDistPx: ARENA_MIN_SPAWN_DIST_PX,
      onSpawn: (entity, kind) => {
        controller.mobKinds.set(entity, kind);
      },
    });

    this.survivalHud = new SurvivalHUD(ctx.app);
    controller.layers.ui.addChild(this.survivalHud.container);

    this.levelUpModal = new LevelUpChoiceModal(ctx.app);
    // Mount LAST so the modal sits on top of every other UI layer
    // child (joystick, hotbar, touch buttons) — its `eventMode:'static'`
    // backdrop then swallows all stray taps.
    controller.layers.ui.addChild(this.levelUpModal.container);
  }

  exit(ctx: GameContext): void {
    this.levelUpModal?.destroy();
    this.levelUpModal = null;
    this.survivalHud?.destroy();
    this.survivalHud = null;
    this.controller?.destroy();
    this.controller = null;
    this.waveSpawner = null;
    void ctx;
  }

  update(dt: number): void {
    // Hard pause while a level-up modal owns the screen — neither the
    // ECS pipeline nor the wave drip nor the run timer ticks. The
    // modal's eventMode:'static' backdrop eats stray pointer events,
    // so the joystick / hotbar can't fire either.
    if (this.levelUpModal?.isOpen) return;

    this.controller?.update(dt);
    if (this.controller?.ui.isPaused()) return;
    this.runState.tick(dt);
    if (this.controller && this.waveSpawner) {
      this.waveSpawner.update(dt, this.controller.world);
    }
    if (this.survivalHud && this.waveSpawner) {
      const snap = this.runState.read();
      this.survivalHud.setState({
        elapsedMs: snap.elapsedMs,
        wave: Math.max(1, this.waveSpawner.currentWave + 1),
        kills: snap.kills,
      });
    }
    // Drain queued level-up picks one at a time. Multiple modals
    // never overlap — the next one opens after the player taps a card
    // and the modal closes itself.
    if (this.pendingChoices > 0 && this.levelUpModal && !this.levelUpModal.isOpen) {
      this.openNextLevelUpModal();
    }
  }

  private openNextLevelUpModal(): void {
    const modal = this.levelUpModal;
    const controller = this.controller;
    if (!modal || !controller || controller.playerId === null) return;
    const choices = rollUpgradeChoices(UPGRADE_PICKS_PER_LEVELUP, this.runUpgrades);
    if (choices.length === 0) {
      // Pool exhausted (shouldn't happen at v1's 10-upgrade pool size,
      // but defend against future shrinks). Skip the pick silently.
      this.pendingChoices = Math.max(0, this.pendingChoices - 1);
      return;
    }
    modal.open(choices, (kind) => {
      this.applyPickedUpgrade(kind);
      this.pendingChoices = Math.max(0, this.pendingChoices - 1);
      modal.close();
    });
  }

  private applyPickedUpgrade(kind: UpgradeKind): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const def = UPGRADES[kind];
    def.apply({ world: controller.world, playerId: controller.playerId });
    this.runUpgrades.push(kind);
  }

  /** Walk the accumulated upgrade stack and re-apply each one that
   *  isn't `oneShot`. Called right after DeathSystem level-ups so the
   *  Dart-row stat reset doesn't wipe additive bonuses on ATK / DEF /
   *  M.ATK / M.DEF / HP max. Multiplicative + content-unlock upgrades
   *  are marked oneShot and skipped. */
  private reapplyStackedUpgrades(): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const ctx = { world: controller.world, playerId: controller.playerId };
    for (const kind of this.runUpgrades) {
      const def = UPGRADES[kind];
      if (def.oneShot) continue;
      def.apply(ctx);
    }
  }

  /** Capture the run's stats the moment the player dies, while the
   *  controller and its ECS world are still alive. Read once and pass
   *  the snapshot into RunSummaryScene so the scene swap can tear
   *  everything down without losing the values to display. */
  private snapshotRun(): {
    ms: number;
    wave: number;
    kills: number;
    level: number;
    character: CharacterDef;
  } {
    const snap = this.runState.read();
    const wave = Math.max(1, (this.waveSpawner?.currentWave ?? 0) + 1);
    let level = 1;
    if (this.controller && this.controller.playerId !== null) {
      const prog = this.controller.world.getComponent(this.controller.playerId, 'Progression');
      if (prog) level = prog.level;
    }
    return { ms: snap.elapsedMs, wave, kills: snap.kills, level, character: this.character };
  }
}
