import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFAULT_DURATION_MS = 900;
const RISE_OFFSET_Y = -28;

/** TLoD-style unified damage / heal palette. Every number that pops over
 *  a sprite uses one of these two colours so the player can read combat
 *  feedback at a glance — yellow = damage (any source), mauve = HP gain
 *  (any source). XP / level-up pops keep their own gold tone, defined
 *  next to their spawn sites. */
export const FLOAT_DAMAGE = 0xffd166;
export const FLOAT_HEAL = 0x9bb6ff;

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
