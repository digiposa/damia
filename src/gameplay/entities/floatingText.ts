import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFAULT_DURATION_MS = 900;
const RISE_OFFSET_Y = -28;

/** TLoD-style damage / recovery palette. Every number that pops over a
 *  sprite picks one of these tones so the player can read combat feedback
 *  at a glance:
 *    - yellow → damage taken / dealt (any source).
 *    - cyan   → HP recovery (potion, regen, heal spell). Matches the
 *               canonical TLoD HP-tick colour from the PSX HUD.
 *    - mauve  → MP recovery (MP potion / regen / drain return). Kept
 *               separate from HP so the player can tell at a glance
 *               which gauge just changed.
 *  XP / level-up pops keep their own gold tone, defined next to their
 *  spawn sites. */
export const FLOAT_DAMAGE = 0xffd166;
export const FLOAT_HEAL_HP = 0x80e0ff;
export const FLOAT_HEAL_MP = 0x9bb6ff;

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
