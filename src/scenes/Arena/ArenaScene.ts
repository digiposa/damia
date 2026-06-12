import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import { TitleScene } from '../TitleScene';
import { RunSummaryScene } from '../RunSummaryScene';
import { RunState } from '@/store/RunState';
import { MODE_TUNING } from '@data/mode';
import { ADDITIONS, MOBS, type AdditionKind } from '@data/balance';
import { WaveSpawnerSystem } from '@gameplay/systems/WaveSpawnerSystem';
import { ARENA_MIN_SPAWN_DIST_PX, ARENA_WAVE_DURATION_MS, buildArenaWave } from '@data/arenaWaves';
import { SurvivalHUD } from '@ui/SurvivalHUD';
import { LevelUpChoiceModal } from '@ui/LevelUpChoiceModal';
import { UPGRADES, rollUpgradeChoices, type UpgradeKind } from '@data/upgrades';
import { DART, type CharacterDef } from '@data/characters';
import { RunHighScores } from '@services/RunHighScores';
import { UnlockManager } from '@services/UnlockManager';
import type { AssetTag } from '@services/AssetManager';

/** Logical arena dimensions in iso tiles. The painted backdrop
 *  (`map.forest.survival`) is 1456x720 native pixels — at the engine's
 *  TILE_HALF_W = 64, the largest square iso grid whose bounds fit
 *  inside that image is 11x11 (bounds = 1408x704, ~24 px margin per
 *  side). Going larger would have the player walk past the painted
 *  area into bare iso ground. If the backdrop is regenerated at a
 *  different resolution, recompute via:
 *    ARENA_SIZE = Math.floor(imageWidth / (2 * TILE_HALF_W))    */
const ARENA_SIZE = 11;
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
  // Painted backdrop + every mob the wave builder can spawn. Player
  // tag is added dynamically by the constructor since the avatar is
  // picked at runtime (CharacterSelectScene). Bosses (`fruegel`,
  // `knightOfSandora`, `commanderSeles`) are NOT in the v1 arena
  // pool; if/when they're wired in `arenaWaves.ts`, append the
  // corresponding `mob:<kind>` tags here.
  readonly requiredTags: readonly AssetTag[];
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
    this.requiredTags = [
      `player:${character.id}`,
      'zone:forestArena',
      'mob:berserkMouse',
      'mob:goblin',
      'mob:assassinCock',
      'mob:trent',
    ];
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
        // Desktop needs the addition cooldown + selector visible since the
        // long-press-for-picker affordance lives on touch only — without
        // the bar the survival player can't see when their addition is
        // off cooldown nor which addition is bound. Hidden automatically
        // on touch builds by GameplayUI (the touch picker covers that
        // role there).
        showAdditionsBar: true,
        // Painted iso backdrop instead of the grid-tiled floor. To enable:
        //   1. Drop the PNG at public/assets/maps/forest-survival.png
        //      (target 2:1 aspect ratio — iso projection is twice as
        //      wide as tall).
        //   2. Uncomment the `map.forest.survival` entry in
        //      AssetManager.ts so the texture preloads.
        //   3. Uncomment the line below.
        // Falls back to the regular TileMap renderer automatically when
        // the asset is missing or the line stays commented.
        prerenderedMapAsset: 'map.forest.survival',
        // Dev / testing: skip the canonical first-boss-kill gate so
        // the Dragoon form can be triggered from the first second of
        // the run. Flip to false (or delete) before shipping a real
        // Survival progression curve.
        dragoonStartUnlocked: true,
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
        unlockedAdditions: (level) => this.unlockedAdditions(level),
        onPlayerDeath: () => {
          const summary = this.snapshotRun();
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new RunSummaryScene(summary), ctx);
          });
        },
        onQuit: () => {
          // Persist + evaluate unlocks BEFORE switching scenes so a
          // player who quits a high-water-mark run (without dying)
          // still gets credit on the leaderboard + on the unlock
          // ladder. Without this, the only way to bank a run was to
          // die — frustrating when an over-leveled Dart simply
          // can't be killed by current mob stats.
          this.persistRunOnExit();
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new TitleScene(), ctx);
          });
        },
        onMobDeath: (kind) => {
          this.runState.recordKill(MOBS[kind].xp);
          // Tag boss kills separately so the dragoonUnlock upgrade can
          // gate itself behind the first one (VISION §6.5).
          if (MOBS[kind].boss) this.runState.recordBossKill();
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
    const choices = rollUpgradeChoices(UPGRADE_PICKS_PER_LEVELUP, {
      ownedKinds: this.runUpgrades,
      bossesKilled: this.runState.read().bossesKilled,
    });
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

  /** Resolve the addition pool for the run's chosen avatar at the
   *  current level. Filters against `ADDITIONS` so the picker only
   *  surfaces slugs the engine actually knows. The Master Addition
   *  is appended once every basic on the kit is mastered to Lv 5
   *  — see `isMasterUnlocked`. */
  private unlockedAdditions(level: number): ReadonlyArray<AdditionKind> {
    const archetype = this.character.archetype;
    const out: AdditionKind[] = [];
    for (const [unlockLv, slug] of archetype.additionUnlocksByLevel) {
      if (level < unlockLv) continue;
      if (slug in ADDITIONS) out.push(slug);
    }
    if (archetype.masterAddition && this.isMasterUnlocked()) {
      out.push(archetype.masterAddition);
    }
    return out.length > 0 ? out : [archetype.additionUnlocksByLevel.get(1) ?? 'doubleSlash'];
  }

  /** Master Addition gating: TLoD canon requires every basic addition
   *  in the kit to be mastered to Lv 5 (= 80+ uses). Reads the live
   *  `Progression.additionUses` counter off the player. */
  private isMasterUnlocked(): boolean {
    if (!this.controller || this.controller.playerId === null) return false;
    const prog = this.controller.world.getComponent(this.controller.playerId, 'Progression');
    if (!prog) return false;
    for (const slug of this.character.archetype.additionUnlocksByLevel.values()) {
      if ((prog.additionUses[slug] ?? 0) < 80) return false;
    }
    return true;
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

  /** Submit a snapshot of the live run to the high-score table and
   *  pump any qualifying unlocks. Called from the Quit-to-title path
   *  so a player who's clearly conquered the current scaling can
   *  still bank progress; death's path goes through RunSummaryScene
   *  which does the same write + banner reveal. No-op when the run
   *  hasn't started yet (player quit before the first wave). */
  private persistRunOnExit(): void {
    const summary = this.snapshotRun();
    if (summary.ms <= 0) return;
    const rank = RunHighScores.submit({
      ms: summary.ms,
      wave: summary.wave,
      kills: summary.kills,
      level: summary.level,
      character: summary.character.id,
      savedAtMs: Date.now(),
    });
    // evaluateUnlocks reads `load()` internally so it sees the
    // freshly-submitted record. Discard the returned diff list — the
    // CharacterSelectScene will surface any newly-unlocked entries
    // the next time the player opens it; we don't pop a banner on
    // the quit path because there's no overlay to host it.
    UnlockManager.evaluateUnlocks({
      ms: summary.ms,
      wave: summary.wave,
      kills: summary.kills,
      level: summary.level,
      character: summary.character.id,
      savedAtMs: Date.now(),
    });
    // Suppress the unused-rank warning — kept the variable for the
    // future case where we want to show a toast on quit if the run
    // made the leaderboard.
    void rank;
  }
}
