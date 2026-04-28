import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFAULT_DURATION_MS = 900;
const RISE_OFFSET_Y = -28;

export interface SpawnFloatingTextOptions {
  x: number;
  y: number;
  text: string;
  color?: number;
  durationMs?: number;
}

export function spawnFloatingText(
  world: World<Components>,
  opts: SpawnFloatingTextOptions,
): Entity {
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x: opts.x, y: opts.y + RISE_OFFSET_Y });
  world.addComponent(id, 'FloatingText', {
    text: opts.text,
    color: opts.color ?? 0xffffff,
    elapsedMs: 0,
    durationMs: opts.durationMs ?? DEFAULT_DURATION_MS,
  });
  return id;
}
