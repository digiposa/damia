/**
 * Visual-only attack lunge: while present on an entity, RenderSystem offsets
 * its sprite forward in (dirX, dirY) and back. Cleared by AttackSwingSystem
 * when elapsedMs >= totalMs. Position component is NOT touched, so combat /
 * pathfinding / collision logic stay correct.
 */
export interface AttackSwing {
  elapsedMs: number;
  totalMs: number;
  /** Unit vector pointing from attacker to target at swing-start. */
  dirX: number;
  dirY: number;
}
