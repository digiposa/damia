/**
 * Runtime combat-speed setting. Owns the live, persisted multiplier used
 * as a per-system time scale: GameplayController multiplies the `dt` of
 * the combat systems (AI, casts, cooldowns, swings, projectiles,
 * additions, defend, Dragoon, death anims) by this value, so the whole
 * fight slows / speeds uniformly while movement, navigation and
 * rendering keep real time.
 *
 * The value is a *speed* fraction where 1.0 = real time, <1 = slower /
 * more readable, >1 = faster:
 *
 *   1.00  → combat at real time
 *   0.80  → 80% speed   (default — the readable ~1.25× slower feel)
 *   0.50  → half speed
 *
 * Because it scales `dt` rather than baking durations, a slider change
 * applies instantly and uniformly — including to timers already in
 * flight — with no per-duration multipliers scattered across the code.
 *
 * Mirrors the AudioManager persistence pattern (module-level state +
 * localStorage on every setter).
 */

const STORAGE_KEY = 'damia.gameplay';

/** Slowest the player can go — half-speed combat. */
export const COMBAT_SPEED_MIN = 0.5;
/** A touch faster than real time, for those who want it. */
export const COMBAT_SPEED_MAX = 1.2;
export const COMBAT_SPEED_STEP = 0.05;
/** 80% speed (~1.25× slower) — the readable default the combat-pacing
 *  pass settled on; the player can dial it back to 1.0 for real time. */
export const COMBAT_SPEED_DEFAULT = 0.8;

let combatSpeed = readPersisted();

function clampSpeed(v: number): number {
  return Math.min(COMBAT_SPEED_MAX, Math.max(COMBAT_SPEED_MIN, v));
}

function readPersisted(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { combatSpeed?: unknown };
      if (typeof parsed.combatSpeed === 'number' && Number.isFinite(parsed.combatSpeed)) {
        return clampSpeed(parsed.combatSpeed);
      }
    }
  } catch {
    // No storage (SSR / private mode / tests) or malformed JSON — fall
    // back to the default. Never let a settings read break startup.
  }
  return COMBAT_SPEED_DEFAULT;
}

function writePersisted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ combatSpeed }));
  } catch {
    // Best-effort persistence; ignore storage failures.
  }
}

/** Current combat-speed fraction (1.0 = original game tuning). */
export function getCombatSpeed(): number {
  return combatSpeed;
}

/** Set the combat-speed fraction (clamped + persisted). Takes effect
 *  immediately on the next frame's combat-system `dt`. */
export function setCombatSpeed(v: number): void {
  combatSpeed = clampSpeed(v);
  writePersisted();
}
