import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFEND_SCALE = 0.85;
const NORMAL_SCALE = 1;

/**
 * While Defending: shrink the player visual, freeze movement.
 * Defending presence/absence is driven by InputController in ForestScene.
 *
 * Scoped to entities that have BOTH `Sprite` and `Player` so the per-frame
 * `sprite.scale` write doesn't clobber any other system that wants to modulate
 * scale on mob/prop sprites.
 */
export class DefenseSystem implements System<Components> {
  update(_dt: number, world: World<Components>): void {
    for (const id of world.query(['Player', 'Sprite'])) {
      const sprite = world.getComponent(id, 'Sprite');
      if (!sprite) continue;
      const defending = world.hasComponent(id, 'Defending');
      const target = defending ? DEFEND_SCALE : NORMAL_SCALE;
      if (sprite.scale !== target) sprite.scale = target;

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
