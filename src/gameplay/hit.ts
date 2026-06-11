/**
 * Hit-rate roll — canon TLoD precision vs avoidance check fired
 * BEFORE the damage formula runs. Every Stats block already exposes
 * `attackHit` / `magicHit` (attacker side) and `attackAvoid` /
 * `magicAvoid` (defender side); they were tracked but never consumed
 * by the engine until now. This module is the consumer.
 *
 * Formula:
 *   effective = clamp(attackerHit - targetAvoid, 0, 100)
 *   miss      = roll(0..99) >= effective
 *
 * Two channels — 'attack' (physical / addition) reads attackHit vs
 * attackAvoid, 'magic' (item magic, future Dragoon magic) reads
 * magicHit vs magicAvoid. Each system that applies damage rolls its
 * own check; damage.ts stays a pure-math function so the formula
 * tests stay deterministic.
 *
 * `Math.random` is the RNG source. Deterministic replay isn't a goal
 * for v1; if we ever ship one, swap this for a seeded RNG threaded
 * from the scene.
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { spawnFloatingText, FLOAT_MISS } from '@gameplay/entities/floatingText';

export type HitChannel = 'attack' | 'magic';

/** Return true if the attack lands, false if it misses. Reads
 *  attacker + target Stats; if either is missing, defaults to a sure
 *  hit (a swing that connects without a Stats block shouldn't be
 *  silently swallowed by a miss). */
export function rollHit(
  world: World<Components>,
  attackerId: number,
  targetId: number,
  channel: HitChannel,
): boolean {
  const atk = world.getComponent(attackerId, 'Stats');
  const tgt = world.getComponent(targetId, 'Stats');
  if (!atk || !tgt) return true;
  const hit = channel === 'attack' ? atk.attackHit : atk.magicHit;
  const avoid = channel === 'attack' ? tgt.attackAvoid : tgt.magicAvoid;
  const effective = Math.max(0, Math.min(100, hit - avoid));
  if (effective >= 100) return true;
  if (effective <= 0) return false;
  return Math.random() * 100 < effective;
}

/** Spawn the "Miss" floating pop over a target. Mixed-case + bright
 *  orange-red to match the PS1 canon banner — the heavy black stroke
 *  is added by FloatingTextSystem for legibility on busy zones. */
export function spawnMissText(world: World<Components>, x: number, y: number): void {
  spawnFloatingText(world, { x, y, text: 'Miss', color: FLOAT_MISS });
}
