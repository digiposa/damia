import type { Entity, System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/**
 * Aggro-range scanner for the player. Each tick, if the player is idle
 * (no manual CombatIntent, no active skill animation, not currently
 * walking somewhere), it picks the nearest valid enemy within
 * `Stats.range × AGGRO_RANGE_MULT` and slaps a `CombatIntent` on the
 * player so the existing `CombatSystem` chases + swings exactly as if
 * the user had clicked that mob.
 *
 * Design notes:
 * - The system is intentionally suppressed while the player is moving
 *   (Pathfinder.targetGrid set or waypoints in flight) so the joystick /
 *   tap-to-move controls keep priority — auto-attack would otherwise
 *   yank Dart back toward enemies the moment the player tried to flee.
 * - Manual CombatIntent (set by tap-on-mob in the scene click handler)
 *   wins: when it exists we leave it alone. CombatSystem clears the
 *   intent when its target dies, at which point this system picks up the
 *   next nearest enemy automatically (so chained engagements feel
 *   seamless without any extra input).
 * - Hidden / Dying mobs are skipped so we don't auto-engage things the
 *   player can't see or things mid-death animation.
 */
const AGGRO_RANGE_MULT = 2;

export class AutoAttackSystem implements System<Components> {
  update(_dt: number, world: World<Components>): void {
    for (const playerId of world.query(['Player', 'Position', 'Stats'])) {
      // User-driven combat / animation states win — never override them.
      if (world.hasComponent(playerId, 'CombatIntent')) continue;
      if (world.hasComponent(playerId, 'Defending')) continue;
      if (world.hasComponent(playerId, 'Addition')) continue;
      if (world.hasComponent(playerId, 'Spell')) continue;
      if (world.hasComponent(playerId, 'Dying')) continue;

      // Movement intent wins — the player is actively going somewhere
      // (joystick poll, tap-to-move, or chasing a previous CombatIntent
      // that just resolved while still in transit).
      const pf = world.getComponent(playerId, 'Pathfinder');
      if (pf && (pf.targetGrid !== null || (pf.waypoints && pf.waypoints.length > 0))) {
        continue;
      }

      const pos = world.getComponent(playerId, 'Position');
      const stats = world.getComponent(playerId, 'Stats');
      if (!pos || !stats) continue;
      const aggroRange = stats.range * AGGRO_RANGE_MULT;

      const nearest = this.findNearestEnemy(world, playerId, pos.x, pos.y, aggroRange);
      if (nearest !== null) {
        world.addComponent(playerId, 'CombatIntent', { targetId: nearest });
      }
    }
  }

  destroy(): void {}

  /** Linear scan over Faction-tagged entities — fine at the current mob
   *  counts. If we ever spawn enough simultaneous mobs that this matters
   *  (hundreds), swap for a spatial bucket keyed by the player's tile. */
  private findNearestEnemy(
    world: World<Components>,
    playerId: Entity,
    px: number,
    py: number,
    range: number,
  ): Entity | null {
    let nearestId: Entity | null = null;
    let nearestDistSq = range * range;
    for (const id of world.query(['Faction', 'Position', 'Health'])) {
      if (id === playerId) continue;
      const fac = world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const otherPos = world.getComponent(id, 'Position');
      const hp = world.getComponent(id, 'Health');
      if (!otherPos || !hp || hp.current <= 0) continue;
      if (world.hasComponent(id, 'Hidden')) continue;
      if (world.hasComponent(id, 'Dying')) continue;
      const dx = otherPos.x - px;
      const dy = otherPos.y - py;
      const distSq = dx * dx + dy * dy;
      if (distSq <= nearestDistSq) {
        nearestDistSq = distSq;
        nearestId = id;
      }
    }
    return nearestId;
  }
}
