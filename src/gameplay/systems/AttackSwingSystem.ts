import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/** Advances each AttackSwing component's timer; removes it when complete. */
export class AttackSwingSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['AttackSwing'])) {
      const swing = world.getComponent(id, 'AttackSwing');
      if (!swing) continue;
      swing.elapsedMs += dt;
      if (swing.elapsedMs >= swing.totalMs) {
        world.removeComponent(id, 'AttackSwing');
      }
    }
  }
}
