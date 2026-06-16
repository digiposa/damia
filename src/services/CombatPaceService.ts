/**
 * Runtime combat-pace setting. Owns the live, persisted "combat speed"
 * multiplier that stretches combat-action timings (attack swings, the
 * auto-attack cadence, spell casts) without touching movement.
 *
 * User-facing quantity is a *speed* fraction where 1.0 = the original
 * game tuning, <1 = slower / more readable, >1 = faster. We store speed
 * (not the raw stretch factor) because it's the intuitive thing to put
 * behind a slider: lower % = slower combat. The stretch applied to a
 * duration is its inverse — `pace(ms) = round(ms / speed)`:
 *
 *   speed 1.00  → pace ×1.00  (no change)
 *   speed 0.80  → pace ×1.25  (default — ~25% slower, the readable feel)
 *   speed 0.50  → pace ×2.00  (half speed)
 *
 * `pace()` reads the current value at the moment a swing / cast /
 * cooldown is *written*, so a slider change applies to the very next
 * action — live, no scene reload, no per-frame re-query. Actions already
 * in flight keep their baked duration, which is exactly what we want.
 *
 * Mirrors the AudioManager persistence pattern (module-level state +
 * localStorage on every setter).
 */

const STORAGE_KEY = 'damia.gameplay';

/** Slowest the player can go (pace ×2.0). */
export const COMBAT_SPEED_MIN = 0.5;
/** A touch faster than the original tuning, for those who want it. */
export const COMBAT_SPEED_MAX = 1.2;
export const COMBAT_SPEED_STEP = 0.05;
/** Matches the original hardcoded COMBAT_PACE of 1.25 (= 80% speed), so
 *  existing combat feel is unchanged until the player moves the slider. */
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

/** Set the combat-speed fraction (clamped + persisted). Takes effect on
 *  the next action that calls `pace()`. */
export function setCombatSpeed(v: number): void {
  combatSpeed = clampSpeed(v);
  writePersisted();
}

/** Scale a base combat-action duration (ms) by the live pace (inverse of
 *  combat speed), rounded to an integer ms. The single chokepoint every
 *  swing / cast / cooldown timing flows through. */
export function pace(ms: number): number {
  return Math.round(ms / combatSpeed);
}
