export interface Stats {
  /** Base physical attack damage (regular swings + Additions). */
  atk: number;
  /** Flat damage reduction. */
  def: number;
  /** Magical attack power (drives spell-item damage; doesn't affect physical hits). */
  magicAtk: number;
  /** Attacks per second. */
  atkSpeed: number;
  /** Melee reach in world pixels. */
  range: number;
  /** Distance at which a passive entity becomes hostile. 0 = never aggro on its own. */
  aggroRange: number;
}
