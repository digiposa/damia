/**
 * Combat stats. The block mirrors TLoD's Status panel (AT/DF/MAT/MDF/SPEED/
 * A-HIT/M-HIT/A-AV/M-AV) plus the action-RPG specifics we need for our real-
 * time engine (`atkSpeed`, `range`, `aggroRange`).
 *
 * Most of the new TLoD fields are wired with sane defaults but NOT yet read
 * by any system — they're intentionally exposed so future systems (dodge
 * rolls, equipment bonuses, level-up curves) can plug in without a refactor.
 */
export interface Stats {
  /** AT — base physical attack damage (regular swings + Additions). */
  atk: number;
  /** DF — flat physical damage reduction. */
  def: number;
  /** MAT — magical attack power (drives spell-item damage). */
  magicAtk: number;
  /** MDF — flat magical damage reduction (read by SpellSystem when ready). */
  magicDef: number;
  /** SPEED — TLoD-style scalar (50 = baseline). Not yet wired; future equipment/items will mod this and downstream affect movement & attack rate. */
  speed: number;
  /** A-HIT % — chance an Addition hit lands. Default 100 = always hit. */
  attackHit: number;
  /** M-HIT % — chance a magical attack lands. Default 100. */
  magicHit: number;
  /** A-AV % — chance to dodge an incoming physical hit. Default 0. */
  attackAvoid: number;
  /** M-AV % — chance to dodge an incoming magical hit. Default 0. */
  magicAvoid: number;
  /** Attacks per second (action-RPG specific, drives AttackCooldown.remainingMs). */
  atkSpeed: number;
  /** Melee reach in world pixels (action-RPG specific). */
  range: number;
  /** Distance at which a passive entity becomes hostile. 0 = never aggro on its own. */
  aggroRange: number;
}
