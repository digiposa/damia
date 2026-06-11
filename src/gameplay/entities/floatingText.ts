import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const DEFAULT_DURATION_MS = 900;
const RISE_OFFSET_Y = -28;

/** Vertical clearance between two stacked floating numbers. Tuned to the
 *  22-px font in FloatingTextSystem — a bit more than one line so the
 *  numbers stay individually readable rather than touching. */
const STACK_OFFSET_Y = 24;
/** Horizontal "same column" tolerance. Two pops within this X delta of
 *  each other are considered to be over the same sprite and will stack;
 *  pops over different sprites get their own column. Picked so a typical
 *  mob (~64 px iso footprint) registers as one column. */
const STACK_RADIUS_X = 40;
/** Safety cap on the iterative slot search so a freak pile-up can't spin
 *  the loop. At 8 stacked numbers we're well past readable anyway. */
const MAX_STACK_PASSES = 8;

/** TLoD-style damage / recovery palette. Every number that pops over a
 *  sprite picks one of these tones so the player can read combat feedback
 *  at a glance:
 *    - yellow → damage taken / dealt (any source).
 *    - cyan   → HP recovery (potion, regen, heal spell). Matches the
 *               canonical TLoD HP-tick colour from the PSX HUD.
 *    - mauve  → MP recovery (MP potion / regen / drain return). Kept
 *               separate from HP so the player can tell at a glance
 *               which gauge just changed.
 *    - white  → XP gain. Kept deliberately neutral so it never gets
 *               confused with the damage pop that fires on the same
 *               frame as the killing blow.
 *  Level-up pops keep their own gold tone, defined at their spawn site. */
export const FLOAT_DAMAGE = 0xffd166;
export const FLOAT_HEAL_HP = 0x80e0ff;
export const FLOAT_HEAL_MP = 0x9bb6ff;
export const FLOAT_XP = 0xe6e6e6;
/** "Miss" pop — bright orange-red, matches the PS1 canon "Miss"
 *  banner (warm orange close to fire damage, distinct from the cooler
 *  yellow `FLOAT_DAMAGE`). The stroke from FloatingTextSystem adds
 *  the canonical heavy black outline for legibility on busy zones. */
export const FLOAT_MISS = 0xee4422;

export interface SpawnFloatingTextOptions {
  x: number;
  y: number;
  text: string;
  color?: number;
  durationMs?: number;
}

/** Walk the live FloatingText pool and find a vertical slot near (x, y)
 *  that doesn't collide with any existing pop within STACK_RADIUS_X. We
 *  push UP (smaller Y) because pops rise upward — stacking downward would
 *  put new numbers in the path the existing ones are already vacating.
 *  Iterates because pushing past one neighbour can land us on another. */
function findStackSlotY(world: World<Components>, x: number, baseY: number): number {
  let y = baseY;
  for (let pass = 0; pass < MAX_STACK_PASSES; pass++) {
    let highestConflict: number | null = null;
    for (const id of world.query(['FloatingText', 'Position'])) {
      const pos = world.getComponent(id, 'Position');
      if (!pos) continue;
      if (Math.abs(pos.x - x) > STACK_RADIUS_X) continue;
      if (Math.abs(pos.y - y) >= STACK_OFFSET_Y) continue;
      if (highestConflict === null || pos.y < highestConflict) highestConflict = pos.y;
    }
    if (highestConflict === null) return y;
    y = highestConflict - STACK_OFFSET_Y;
  }
  return y;
}

export function spawnFloatingText(
  world: World<Components>,
  opts: SpawnFloatingTextOptions,
): Entity {
  const id = world.createEntity();
  const y = findStackSlotY(world, opts.x, opts.y + RISE_OFFSET_Y);
  world.addComponent(id, 'Position', { x: opts.x, y });
  world.addComponent(id, 'FloatingText', {
    text: opts.text,
    color: opts.color ?? 0xffffff,
    elapsedMs: 0,
    durationMs: opts.durationMs ?? DEFAULT_DURATION_MS,
  });
  return id;
}
