import type { Container } from 'pixi.js';
import { Text } from 'pixi.js';
import type { Entity, System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

const RISE_PIXELS_PER_MS = 0.03;

/**
 * Manages a Pixi Text node per entity that has a FloatingText component.
 * Animates the node upward and fades it out over `durationMs`, then destroys
 * both the node and the entity.
 */
export class FloatingTextSystem implements System<Components> {
  private readonly nodes = new Map<Entity, Text>();

  constructor(private readonly parent: Container) {}

  update(dt: number, world: World<Components>): void {
    const matched = new Set<Entity>(world.query(['FloatingText', 'Position']));

    for (const id of matched) {
      const ft = world.getComponent(id, 'FloatingText');
      const pos = world.getComponent(id, 'Position');
      if (!ft || !pos) continue;

      let node = this.nodes.get(id);
      if (!node) {
        node = new Text({
          text: ft.text,
          style: {
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            fill: ft.color,
            stroke: { color: 0x000000, width: 3 },
            fontWeight: 'bold',
          },
        });
        node.anchor.set(0.5, 1);
        this.parent.addChild(node);
        this.nodes.set(id, node);
      }

      ft.elapsedMs += dt;
      const t = ft.elapsedMs / ft.durationMs;
      pos.y -= RISE_PIXELS_PER_MS * dt;
      node.position.set(pos.x, pos.y);
      node.alpha = Math.max(0, 1 - t);

      if (ft.elapsedMs >= ft.durationMs) {
        world.destroyEntity(id);
      }
    }

    // Cleanup nodes for entities no longer present (or destroyed above).
    for (const [id, node] of this.nodes) {
      if (!world.hasComponent(id, 'FloatingText')) {
        node.destroy();
        this.nodes.delete(id);
      }
    }
  }

  destroy(): void {
    for (const node of this.nodes.values()) node.destroy();
    this.nodes.clear();
  }
}
