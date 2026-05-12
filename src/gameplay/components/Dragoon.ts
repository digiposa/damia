import type { Stats } from './Stats';

/**
 * Transient component carrying the live Dragoon transformation
 * state. Present on the player only while transformed; absent
 * otherwise. The DragoonSystem ticks `timerMs` down each frame
 * (passive drain) and on each action (action drain). When
 * `timerMs <= 0` the system reverses the multipliers stored in
 * `preStats` / `preMoveSpeed` / `preHpMax`, restores the base
 * sprite aliases (`avatar.sprite.base.*`), and removes the
 * component.
 *
 * Snapshotting the pre-transform state on this component sidesteps
 * floating-point drift over multiple transform cycles (no
 * accumulated rounding from "× 1.3 ÷ 1.3" math) and stays correct
 * even when the player ate a level-up during the transform (the
 * scene re-snapshots after applyArchetypeRow runs).
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
  /** Health.max at transform start. Health.current isn't
   *  snapshotted because we don't want to revert combat damage
   *  taken during the transform — the player's HP at end-of-form
   *  carries over (clamped to the restored max). */
  preHpMax: number;
}

/** Multipliers applied at transform start. Subset of Stats keys
 *  the player's `Dragoon` config affects + Speed + HP. */
export type DragoonMultiplierKey =
  | keyof Pick<Stats, 'atk' | 'def' | 'magicAtk' | 'magicDef'>
  | 'moveSpeed'
  | 'hp';
