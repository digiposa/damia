import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFEND_SCALE = 0.85;
const NORMAL_SCALE = 1;

/**
 * While Defending: shrink the visual, freeze movement.
 * Defending presence/absence is driven by InputController in ForestScene.
 */
export class DefenseSystem implements System<Components> {
  update(_dt: number, world: World<Components>): void {
    for (const id of world.query(['Sprite'])) {
      const sprite = world.getComponent(id, 'Sprite');
      if (!sprite) continue;
      const defending = world.hasComponent(id, 'Defending');
      sprite.scale = defending ? DEFEND_SCALE : NORMAL_SCALE;

      if (defending) {
        const pf = world.getComponent(id, 'Pathfinder');
        if (pf) {
          pf.waypoints = null;
          pf.targetGrid = null;
        }
      }
    }
  }
}
