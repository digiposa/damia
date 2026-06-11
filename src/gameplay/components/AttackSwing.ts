/**
 * Visual-only attack lunge: while present on an entity, RenderSystem offsets
 * its sprite forward in (dirX, dirY) and back. Cleared by AttackSwingSystem
 * when elapsedMs >= totalMs. Position component is NOT touched, so combat /
 * pathfinding / collision logic stay correct.
 *
 * `kind` lets the renderer pick the right frame family: 'melee' (default)
 * → attackFrames / attackTextureAlias, 'throw' → throwFrames. Useful for
 * mobs that have a secondary ranged ability (Knight of Sandora's Throw
 * Dagger) — the AI tags the swing at trigger time so the visual matches
 * the gameplay intent.
 */
export interface AttackSwing {
  elapsedMs: number;
  totalMs: number;
  /** Unit vector pointing from attacker to target at swing-start. */
  dirX: number;
  dirY: number;
  /** Animation family. Default 'melee' when omitted. */
  kind?: 'melee' | 'throw';
}
