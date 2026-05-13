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
 * Damage is computed at hit time so the target's current DEF +
 * Defending state apply. We snapshot the attacker's ATK and LV at
 * fire time (the attacker may level up, equip gear, leave Dragoon
 * form etc. before the arrow lands — TLoD canon "freezes" the
 * attacker's state at the swing moment).
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
  /** Attacker's effective AT at fire time (already includes the
   *  Dragoon multiplier when applicable). Plugged into the player
   *  Archer Attack formula at hit time. */
  attackerAt: number;
  /** Attacker's character level at fire time. Used by the Archer
   *  Attack formula's `(LV + 5) × 5` factor. */
  attackerLv: number;
  /** Wall-clock since fire (ms). */
  elapsedMs: number;
  /** Hard despawn timer. The system kills any arrow whose elapsed
   *  exceeds this regardless of whether it hit anything. */
  maxLifeMs: number;
  /** Collision tolerance with target entities (world px). */
  hitRadiusPx: number;
}
