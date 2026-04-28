import type { Entity, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { MOBS } from '@data/balance';

export function spawnBerserkMouse(world: World<Components>, gx: number, gy: number): Entity {
  const def = MOBS.berserkMouse;
  const { x, y } = gridToWorld(gx, gy);
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x, y });
  world.addComponent(id, 'Velocity', { vx: 0, vy: 0 });
  world.addComponent(id, 'Speed', { value: def.speed });
  world.addComponent(id, 'Pathfinder', { targetGrid: null, waypoints: null, computing: false });
  world.addComponent(id, 'Health', { current: def.health, max: def.health, invulnUntilMs: 0 });
  world.addComponent(id, 'Stats', { ...def.stats });
  world.addComponent(id, 'Faction', { side: 'enemy' });
  world.addComponent(id, 'AttackCooldown', { remainingMs: 0 });
  world.addComponent(id, 'Sprite', { ...def.sprite, layer: 'entities' });
  return id;
}
