import type { AdditionKind } from '@data/balance';

/**
 * Per-skill cooldown timers in ms. AdditionSystem decrements every entry on
 * each tick; reads short-circuit when an entry is missing (= ready). The map
 * is mutated in place so the entity owns its own cooldown state.
 */
export interface SkillCooldown {
  remainingMs: Partial<Record<AdditionKind, number>>;
}
