import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/**
 * While Defending: freeze movement. The visual swap (idle → defend pose) is
 * handled by RenderSystem via `Sprite.defendTextureAlias`.
 * Defending presence/absence is driven by InputController in ForestScene.
 */
export class DefenseSystem implements System<Components> {
  update(_dt: number, world: World<Components>): void {
    for (const id of world.query(['Player', 'Defending', 'Pathfinder'])) {
      const pf = world.getComponent(id, 'Pathfinder');
      if (!pf) continue;
      pf.waypoints = null;
      pf.targetGrid = null;
    }
  }
}
