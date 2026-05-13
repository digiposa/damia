import type { Stats } from './Stats';

/**
 * Transient component carrying the live Dragoon transformation state.
 * Present on the player only while transformed; absent otherwise.
 * DragoonSystem ticks `timerMs` down each frame and removes the
 * component on expiry, restoring the snapshotted stats/speed.
 *
 * Max HP is NOT snapshotted: the canonical TLoD Dragoon form does not
 * multiply max HP (see VISION §6.2), so a level-up mid-transform
 * propagates cleanly to `Health.max` without any restore logic to
 * fight against it.
 */
export interface Dragoon {
  /** Remaining transform duration in ms. */
  timerMs: number;
  /** Initial timerMs at transform start — drives the HUD %
   *  countdown display. */
  maxTimerMs: number;
  /** Stats values to restore on transform end. */
  preAtk: number;
  preDef: number;
  preMagicAtk: number;
  preMagicDef: number;
  /** Movement speed (Speed.value) at transform start. */
  preMoveSpeed: number;
}

/** Multipliers applied at transform start. Subset of Stats keys
 *  the player's `Dragoon` config affects + Speed. */
export type DragoonMultiplierKey =
  | keyof Pick<Stats, 'atk' | 'def' | 'magicAtk' | 'magicDef'>
  | 'moveSpeed';
