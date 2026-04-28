import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/** Decrements `AttackCooldown.remainingMs` each frame. Clamps at 0. */
export class CooldownSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['AttackCooldown'])) {
      const cd = world.getComponent(id, 'AttackCooldown');
      if (!cd) continue;
      if (cd.remainingMs > 0) cd.remainingMs = Math.max(0, cd.remainingMs - dt);
    }
  }
}
