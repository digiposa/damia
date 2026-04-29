import type { Entity, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { PROPS, pickPropVariant, type PropKind } from '@data/props';

export interface SpawnPropOptions {
  kind: PropKind;
  gx: number;
  gy: number;
}

export function spawnProp(world: World<Components>, opts: SpawnPropOptions): Entity {
  const def = PROPS[opts.kind];
  const { x, y } = gridToWorld(opts.gx, opts.gy);
  const id = world.createEntity();

  world.addComponent(id, 'Position', { x, y });
  const textureAlias = pickPropVariant(opts.kind, opts.gx, opts.gy);
  world.addComponent(id, 'Sprite', {
    ...def.sprite,
    layer: 'entities',
    ...(textureAlias ? { textureAlias } : {}),
  });
  if (def.blocks) {
    world.addComponent(id, 'Collider', { gx: opts.gx, gy: opts.gy, blocks: true });
  }
  return id;
}
