/**
 * Visual-only attack lunge: while present on an entity, RenderSystem offsets
 * its sprite forward in (dirX, dirY) and back. Cleared by AttackSwingSystem
 * when elapsedMs >= totalMs. Position component is NOT touched, so combat /
 * pathfinding / collision logic stay correct.
 *
 * `kind` lets the renderer pick the right frame family:
 *   'melee'      (default) → attackFrames / attackTextureAlias
 *   'throw'                → throwFrames (Knight of Sandora ranged dagger)
 *   'slashTwice'           → slashTwiceFrames (Commander Seles post-PowerUp
 *                            basic attack — replaces the regular Sword
 *                            Slash visual; CombatSystem applies the canon
 *                            2× damage multiplier in lockstep).
 */
export interface AttackSwing {
  elapsedMs: number;
  totalMs: number;
  /** Unit vector pointing from attacker to target at swing-start. */
  dirX: number;
  dirY: number;
  /** Animation family. Default 'melee' when omitted. */
  kind?: 'melee' | 'throw' | 'slashTwice';
}
