import type { FactionSide } from './Faction';

/**
 * In-flight ranged attack (arrow, future spell bolt…). Spawned by
 * `CombatSystem` when a ranged-character entity attacks; advanced
 * + collision-checked by `ProjectileSystem`; the projectile entity
 * carries its own `Position` + `Sprite` so it slots into the
 * existing render path without special casing.
 *
 * Hit detection is straight-line single-target: the arrow flies along
 * `(dirX, dirY)` at `speedPxPerMs`, the system checks each frame
 * whether any opposing-faction entity is inside `hitRadiusPx` of
 * the arrow's current position. First hit applies damage + despawns.
 * `maxLifeMs` is the hard ceiling — if the arrow misses everything,
 * it's destroyed when the timer expires (no "infinite arrow" debris).
 *
 * Damage is computed at hit time (not fire time) so the target's
 * current DEF + Defending state apply. Storing only `atk` + `roll`
 * keeps the random factor fixed per arrow so two arrows fired in the
 * same frame don't deal an identical damage roll twice in a row when
 * the variance is large.
 */
export interface Projectile {
  /** Entity that fired the arrow. Excluded from collision so
   *  Shana doesn't shoot herself in the foot. */
  sourceId: number;
  /** Faction of the source. Only entities of the OPPOSING side can
   *  be hit. Mob arrows could one day hit the player by flipping
   *  this — for now only the player fires projectiles. */
  sourceFaction: FactionSide;
  /** Unit-vector direction of travel. Computed at fire time, never
   *  updated mid-flight (straight-line). */
  dirX: number;
  dirY: number;
  /** World pixels per millisecond. Larger = faster arrow. */
  speedPxPerMs: number;
  /** Attacker's ATK at fire time. Damage rolled at collision via
   *  `computeDamage(atk, target.def, roll, defending)`. */
  atk: number;
  /** Pre-rolled [0, 1) variance factor so the random component is
   *  fixed per arrow. */
  roll: number;
  /** Wall-clock since fire (ms). */
  elapsedMs: number;
  /** Hard despawn timer. The system kills any arrow whose elapsed
   *  exceeds this regardless of whether it hit anything. */
  maxLifeMs: number;
  /** Collision tolerance with target entities (world px). */
  hitRadiusPx: number;
}
