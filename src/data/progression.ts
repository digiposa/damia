/**
 * Level-up curve. Pure helper so balance is one knob to tune. Keep it cheap
 * to compute (called once per level-up, not per frame).
 *
 * Formula: 100 × level^1.5 rounded — gentle ramp, ~283 for level 2→3, ~520
 * for 3→4, etc. Tunable later as we get a sense of mob-XP economy.
 */
export function xpToNext(level: number): number {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.5));
}
