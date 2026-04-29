import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/** Advances each Dying timer; destroys the entity when the death animation completes. */
export class DyingSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['Dying'])) {
      const dying = world.getComponent(id, 'Dying');
      if (!dying) continue;
      dying.elapsedMs += dt;
      if (dying.elapsedMs >= dying.totalMs) {
        world.destroyEntity(id);
      }
    }
  }
}
