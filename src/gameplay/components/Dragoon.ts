import type { Stats } from './Stats';

/**
 * Transient marker carrying the live Dragoon transformation state.
 * Present on the player only while transformed; absent otherwise.
 * DragoonSystem ticks `timerMs` down each frame and removes the
 * component on expiry.
 *
 * Stats are NOT mutated on enter / restored on exit — the multiplier
 * is applied at read time by `gameplay/stats.ts` helpers (see VISION
 * §6.1 & §6.2). This keeps level-ups and upgrade picks that happen
 * mid-transform correct without any snapshot-refresh dance: the base
 * stats stored in `Stats` always reflect archetype row + upgrades,
 * and the effective values come from `effectiveAtk()` / siblings.
 */
export interface Dragoon {
  /** Remaining transform duration in ms. */
  timerMs: number;
  /** Initial timerMs at transform start — drives the HUD %
   *  countdown display. */
  maxTimerMs: number;
}

/** Multipliers applied at transform start. Subset of Stats keys
 *  the player's `Dragoon` config affects + Speed. */
export type DragoonMultiplierKey =
  | keyof Pick<Stats, 'atk' | 'def' | 'magicAtk' | 'magicDef'>
  | 'moveSpeed';
