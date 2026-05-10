/**
 * Active defend stance — present means the entity halves incoming damage
 * (handled in `computeDamage` via the `defending` flag) and is locked in
 * place (DefenseSystem clears its Pathfinder).
 *
 * `elapsedMs / totalMs` drives the forced-duration release so a tap-to-
 * defend commits the player to the full 3 s rather than letting them
 * bail mid-block. Defenders are auto-released by DefenseSystem once
 * `elapsedMs >= totalMs`.
 */
export interface Defending {
  elapsedMs: number;
  totalMs: number;
}
