/**
 * Effective-stat helpers. Per VISION §6.2 the Dragoon transformation
 * multiplies offense / defense / move-speed; per VISION §6.1 (the
 * upcoming SP-as-timer refactor) the multiplier is **applied at read
 * time**, not persisted into `Stats` / `Speed`. That contract keeps
 * the per-frame combat math correct in the presence of level-ups and
 * upgrade picks that happen mid-transform — the base stats stored on
 * the entity reflect the archetype row + accumulated upgrades, and
 * these helpers layer the form's multiplier on top whenever they're
 * called.
 *
 * Non-Dragoon entities and entities without a Character component
 * just see identity multipliers (the call still works for mobs).
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import type { DragoonStatsMultiplier } from '@data/characters/types';

const IDENTITY: DragoonStatsMultiplier = {
  atk: 1,
  def: 1,
  magicAtk: 1,
  magicDef: 1,
  moveSpeed: 1,
};

/** Active multiplier set for the entity. Identity unless the entity
 *  has a `Dragoon` component AND a `Character` component (whose
 *  archetype declares the per-form multipliers). */
function getMult(world: World<Components>, entityId: number): DragoonStatsMultiplier {
  if (!world.hasComponent(entityId, 'Dragoon')) return IDENTITY;
  const character = world.getComponent(entityId, 'Character');
  return character?.avatar.archetype.dragoon.statsMultiplier ?? IDENTITY;
}

export function effectiveAtk(world: World<Components>, entityId: number): number {
  const stats = world.getComponent(entityId, 'Stats');
  if (!stats) return 0;
  return Math.round(stats.atk * getMult(world, entityId).atk);
}

export function effectiveDef(world: World<Components>, entityId: number): number {
  const stats = world.getComponent(entityId, 'Stats');
  if (!stats) return 0;
  return Math.round(stats.def * getMult(world, entityId).def);
}

export function effectiveMagicAtk(world: World<Components>, entityId: number): number {
  const stats = world.getComponent(entityId, 'Stats');
  if (!stats) return 0;
  return Math.round(stats.magicAtk * getMult(world, entityId).magicAtk);
}

export function effectiveMagicDef(world: World<Components>, entityId: number): number {
  const stats = world.getComponent(entityId, 'Stats');
  if (!stats) return 0;
  return Math.round(stats.magicDef * getMult(world, entityId).magicDef);
}

/** Effective movement speed in world px / ms. Speed is fractional (not
 *  rounded) because MovementSystem multiplies by dt before integration. */
export function effectiveMoveSpeed(world: World<Components>, entityId: number): number {
  const speed = world.getComponent(entityId, 'Speed');
  if (!speed) return 0;
  return speed.value * getMult(world, entityId).moveSpeed;
}
