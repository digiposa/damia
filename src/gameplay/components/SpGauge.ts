/**
 * Dragoon Spirit Points gauge. Fills via combat actions (Additions
 * for melee archetypes, auto-attacks for ranged); when full the
 * player can trigger the Dragoon transformation. Lives on the
 * player entity from spawn to scene-end.
 *
 * SP gain rates and the cap come from the archetype's
 * `dragoon.spGainPerAddition` / `spGainPerAutoAttack` / `spMax`
 * fields — each archetype tunes its own pacing.
 */
export interface SpGauge {
  current: number;
  max: number;
}
