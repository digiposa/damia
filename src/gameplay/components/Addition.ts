import type { Entity } from '@core/ecs';
import type { AdditionKind, AdditionLevelIndex } from '@data/balance';

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
  /** Indices into ADDITIONS[kind].hitTimingsMs that have already been
   *  *processed* (regardless of whether the hit actually landed). */
  hitsApplied: number;
  /** Number of those checkpoints that actually landed damage. Drives
   *  per-hit SP awards in AdditionSystem. */
  hitsLanded: number;
  /** Did the most recently processed checkpoint land? Set to true after
   *  every successful hit, false on any miss (target dead / out of
   *  range). The voice line plays on completion iff this is still true,
   *  matching TLoD's "addition succeeded" feedback. */
  lastHitLanded: boolean;
  /** Snapshot of the addition's level (1..5) at trigger time. Keeps the
   *  damage / SP table stable mid-animation if the player happens to
   *  cross the 20-uses mastery threshold while the swing is in flight. */
  level: AdditionLevelIndex;
  /** Unit vector toward target at trigger — used by RenderSystem for facing/lunge. */
  dirX: number;
  dirY: number;
  /** Per-hit damage plan. Computed lazily by AdditionSystem on the first
   *  hit checkpoint via `computeAdditionTotalDamage` + `distributeAdditionDamage`
   *  (canonical TLoD formula: full wrapper on Σhits × Multiplier first, then
   *  proportionally split across the hits with the rounding remainder routed
   *  to the last hit so Σ equals the canon total exactly). Cached on the
   *  component so subsequent hits read in O(1) and a mid-animation Stats
   *  change (target Defending halfway through, etc.) doesn't swing the total
   *  — TLoD likewise snapshots state at trigger. Undefined until the first
   *  hit fires; once set it has `def.hits.length` entries. */
  damagePerHit?: readonly number[];
  /** True if the addition-level precision/avoid roll failed at trigger.
   *  Canon TLoD: one miss roll for the whole addition (the wiki's "first
   *  hit guaranteed even with no input" implies the miss check is
   *  sequence-level, not per-hit). When set, AdditionSystem pops a single
   *  "Miss" floating text on hit #0 and applies 0 damage on every
   *  subsequent checkpoint without SP / voice-line credit. */
  missed?: boolean;
}
