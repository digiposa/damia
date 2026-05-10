import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/**
 * Drives the active defend stance:
 *   - Freezes movement (Pathfinder cleared) so the entity stays planted
 *     for the duration of its block.
 *   - Ticks the per-block timer (`elapsedMs`) and auto-removes the
 *     `Defending` component once `elapsedMs >= totalMs`. The forced
 *     duration is what keeps defend feeling like a real commitment
 *     instead of a free hold-key invulnerability.
 *
 * Visual swap (idle ↔ defend pose) is still RenderSystem's job via
 * `Sprite.defendTextureAlias`. Adding the component is the scene's job
 * (player-driven via InputController); we only tick + expire it here.
 */
export class DefenseSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['Defending'])) {
      const def = world.getComponent(id, 'Defending');
      if (!def) continue;
      def.elapsedMs += dt;
      const pf = world.getComponent(id, 'Pathfinder');
      if (pf) {
        pf.waypoints = null;
        pf.targetGrid = null;
      }
      if (def.elapsedMs >= def.totalMs) {
        world.removeComponent(id, 'Defending');
      }
    }
  }
}
