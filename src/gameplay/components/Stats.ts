export interface Stats {
  /** Base attack damage. */
  atk: number;
  /** Flat damage reduction. */
  def: number;
  /** Attacks per second. */
  atkSpeed: number;
  /** Melee reach in world pixels. */
  range: number;
  /** Distance at which a passive entity becomes hostile. 0 = never aggro on its own. */
  aggroRange: number;
}
