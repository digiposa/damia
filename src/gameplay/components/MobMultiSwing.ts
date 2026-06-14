import type { Entity } from '@core/ecs';

/**
 * Multi-hit physical swing scheduled by a mob handler in AISystem. Same
 * shape as `Addition` but bypasses the player-calibrated addition damage
 * formula: each hit applies `computePhysicalDamage` (Enemy Physical:
 * floor[AT² × 5 / DF]) × `perHitMultiplier`, so the result lands in the
 * canon range for mob stats. Used by Commander Seles' post-PowerUp Slash
 * Twice (2 hits × 1×) and a hook for future boss-special multi-strikes.
 *
 * RenderSystem branches on `kind` to swap to the matching frame array
 * from `Sprite.multiSwingFrames?.[kind]`, falling back to the regular
 * attack pose when no dedicated frames are declared (the case until
 * Slash Twice's dedicated sprite ships).
 *
 * Lifecycle: spawned by AISystem, ticked by MobMultiSwingSystem until
 * `elapsedMs >= totalMs`, then removed. Applying hits at checkpoint
 * timings keeps damage paced with the animation (mirror of
 * `AdditionSystem.hitTimingsMs`).
 */
export interface MobMultiSwing {
  /** Slug used by RenderSystem to pick the right frame array. v1: 'slashTwice'. */
  kind: 'slashTwice';
  targetId: Entity;
  /** Unit vector toward target at trigger — picked up by RenderSystem
   *  for the visual lunge offset, same as AttackSwing.dirX/dirY. */
  dirX: number;
  dirY: number;
  elapsedMs: number;
  totalMs: number;
  /** Ms-from-start checkpoints at which each hit applies. Length equals
   *  the canonical hit count for the slug (Slash Twice = 2). */
  hitTimingsMs: readonly number[];
  /** Number of checkpoints already processed — drives the "next-hit
   *  pending" check in MobMultiSwingSystem. */
  hitsApplied: number;
  /** Multiplier applied to the Enemy Physical formula per hit. 1×
   *  matches the canon "Slash Twice = 2× Physical damage total" when
   *  spread across 2 hits. */
  perHitMultiplier: number;
}
