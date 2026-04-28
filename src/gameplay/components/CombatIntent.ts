import type { Entity } from '@core/ecs';

/** Says "this entity wants to engage that target." Cleared on target death or new player command. */
export interface CombatIntent {
  targetId: Entity;
}
