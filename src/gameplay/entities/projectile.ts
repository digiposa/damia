import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import type { FactionSide } from '@gameplay/components';

export interface SpawnProjectileOptions {
  sourceId: Entity;
  sourceFaction: FactionSide;
  /** World-space origin. Typically the source's Position at fire
   *  time, optionally offset along the firing direction so the
   *  arrow doesn't overlap the source's hit radius on frame 1. */
  x: number;
  y: number;
  /** Unit-vector direction of travel. */
  dirX: number;
  dirY: number;
  /** Attacker's ATK — damage rolled at collision against the
   *  target's current DEF. */
  atk: number;
  /** Optional override of the default arrow speed (px/ms). */
  speedPxPerMs?: number;
  /** Optional override of the default flight cap (ms). */
  maxLifeMs?: number;
  /** Optional override of the collision tolerance (world px). */
  hitRadiusPx?: number;
}

const DEFAULT_SPEED_PX_PER_MS = 0.6;
const DEFAULT_MAX_LIFE_MS = 1200;
const DEFAULT_HIT_RADIUS_PX = 24;
const ARROW_LENGTH_PX = 28;
const ARROW_THICKNESS_PX = 4;

/**
 * Build an in-flight arrow entity at (x, y) heading along (dirX, dirY).
 * The visual is a thin brown capsule rotated to match the flight
 * direction (RenderSystem reads Sprite.rotation each frame). Collision
 * + advancement live in `ProjectileSystem`.
 */
export function spawnProjectile(world: World<Components>, opts: SpawnProjectileOptions): Entity {
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x: opts.x, y: opts.y });
  world.addComponent(id, 'Sprite', {
    shape: 'capsule',
    color: 0xa07840,
    width: ARROW_LENGTH_PX,
    height: ARROW_THICKNESS_PX,
    layer: 'fx',
    // Rotate so the capsule's long axis matches the flight vector.
    // atan2 returns the angle the (dirX, dirY) vector makes with the
    // positive X axis — exactly what Pixi's `rotation` expects.
    rotation: Math.atan2(opts.dirY, opts.dirX),
  });
  world.addComponent(id, 'Projectile', {
    sourceId: opts.sourceId,
    sourceFaction: opts.sourceFaction,
    dirX: opts.dirX,
    dirY: opts.dirY,
    speedPxPerMs: opts.speedPxPerMs ?? DEFAULT_SPEED_PX_PER_MS,
    atk: opts.atk,
    roll: Math.random(),
    elapsedMs: 0,
    maxLifeMs: opts.maxLifeMs ?? DEFAULT_MAX_LIFE_MS,
    hitRadiusPx: opts.hitRadiusPx ?? DEFAULT_HIT_RADIUS_PX,
  });
  return id;
}
