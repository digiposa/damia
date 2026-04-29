import type { Entity } from '@core/ecs';
import type { AdditionKind } from '@data/balance';

/**
 * Active Addition (skill animation in flight). While present:
 *  - Movement is frozen (AdditionSystem clears Pathfinder)
 *  - RenderSystem swaps to the addition pose (priority just below Dying)
 *  - AdditionSystem applies damage at each `hitTimingMs` checkpoint
 *
 * Removed when `elapsedMs >= totalMs`. Putting the cooldown reset on completion
 * would let players spam-cancel by interrupt; instead the cooldown is set on
 * trigger and ticked independently by SkillCooldown.
 */
export interface Addition {
  kind: AdditionKind;
  targetId: Entity;
  elapsedMs: number;
  totalMs: number;
  /** Indices into ADDITIONS[kind].hitTimingsMs that have already been applied. */
  hitsApplied: number;
  /** Unit vector toward target at trigger — used by RenderSystem for facing/lunge. */
  dirX: number;
  dirY: number;
}
