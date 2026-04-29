import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import type { VfxKind } from '@gameplay/components/Vfx';

export interface SpawnVfxOptions {
  kind: VfxKind;
  x: number;
  y: number;
  /** End-radius hint, in world px. */
  radius: number;
  /** Lifetime in ms. Defaults to 600. */
  durationMs?: number;
}

/** Spawn a one-shot VFX entity at the given world position. */
export function spawnVfx(world: World<Components>, opts: SpawnVfxOptions): void {
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x: opts.x, y: opts.y });
  world.addComponent(id, 'Vfx', {
    kind: opts.kind,
    elapsedMs: 0,
    durationMs: opts.durationMs ?? 600,
    radius: opts.radius,
  });
}
