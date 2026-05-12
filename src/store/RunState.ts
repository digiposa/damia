/**
 * Per-run state for Survival mode. One instance lives in ArenaScene, ticks
 * each frame and is read by the HUD / WaveSpawnerSystem / RunSummaryScene.
 * Pure data + simple methods — no Pixi or ECS coupling so the upcoming
 * leaderboard write path can serialise it trivially.
 *
 * Levelling here is INDEPENDENT of the player entity's `Progression`
 * component: Story mode owns the Progression and persists it; Survival
 * builds + tears down a fresh `RunState` per run and never touches save
 * state mid-run. The level threshold curve is intentionally simple for
 * v1 — calibration will follow once the wave spawner exists.
 */

export type SurvivalCharacterKind = 'dart';

export interface RunSnapshot {
  /** ms since the run began (paused state freezes this). */
  elapsedMs: number;
  /** Total mobs killed during the run. */
  kills: number;
  /** Current run level (1-based). Drives level-up choice triggers. */
  level: number;
  /** Accumulated XP inside the current level — resets to 0 on level-up. */
  xp: number;
  /** Active character. Always 'dart' in v1; other TLoD party members
   *  (Meru, Rose, Shana, Albert, Haschel, Kongol) unlock through the
   *  meta-progression later. */
  character: SurvivalCharacterKind;
  /** True while a LevelUpChoiceModal or the Settings panel is open —
   *  the scene paused the simulation. */
  paused: boolean;
}

/** XP required to clear level N → N+1. Quadratic so the early-game pops
 *  fast and late game asks for sustained kills. Tweak when the wave
 *  density curve lands. */
function xpThresholdFor(level: number): number {
  return 40 + (level - 1) * 25 + Math.floor((level - 1) * (level - 1) * 4);
}

export class RunState {
  private snapshot: RunSnapshot;
  /** Set by `recordKill` to flag the scene that the player crossed a
   *  level boundary — the scene reads + clears it each frame to open
   *  the level-up modal at most once per level. */
  private pendingLevelUps = 0;

  constructor(character: SurvivalCharacterKind = 'dart') {
    this.snapshot = {
      elapsedMs: 0,
      kills: 0,
      level: 1,
      xp: 0,
      character,
      paused: false,
    };
  }

  /** Advance the run clock. Caller decides when to call (skip when paused). */
  tick(deltaMs: number): void {
    if (this.snapshot.paused) return;
    this.snapshot.elapsedMs += deltaMs;
  }

  /** Register a mob kill and award XP. Multiple level-ups in one kill
   *  (massive XP gain) are queued, so the scene can pop the modal once
   *  per level even on overflow. */
  recordKill(xpGain: number): void {
    this.snapshot.kills++;
    this.snapshot.xp += Math.max(0, xpGain);
    while (this.snapshot.xp >= xpThresholdFor(this.snapshot.level)) {
      this.snapshot.xp -= xpThresholdFor(this.snapshot.level);
      this.snapshot.level++;
      this.pendingLevelUps++;
    }
  }

  /** Consume one queued level-up, if any. Returns true if the scene
   *  should open the level-up modal this frame. */
  consumeLevelUp(): boolean {
    if (this.pendingLevelUps <= 0) return false;
    this.pendingLevelUps--;
    return true;
  }

  setPaused(paused: boolean): void {
    this.snapshot.paused = paused;
  }

  read(): Readonly<RunSnapshot> {
    return this.snapshot;
  }

  /** XP needed to clear the *current* level. The HUD reads this so the
   *  XP bar fills toward the right threshold each level. */
  get xpToNext(): number {
    return xpThresholdFor(this.snapshot.level);
  }

  /** XP fraction toward next level — [0, 1]. HUD bar reads this. */
  xpFrac(): number {
    const need = xpThresholdFor(this.snapshot.level);
    return need <= 0 ? 0 : Math.min(1, this.snapshot.xp / need);
  }
}
