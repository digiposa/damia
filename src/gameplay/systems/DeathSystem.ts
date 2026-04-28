import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { spawnFloatingText } from '@gameplay/entities/floatingText';
import { MOBS, type MobKind } from '@data/balance';

export type PlayerDeathListener = () => void;

/**
 * Sweeps entities at or below 0 HP. Players trigger Game Over (via listener).
 * Other entities are destroyed and yield XP (placeholder: floating "+N XP" text).
 *
 * For M4 the only mob spawned is `berserkMouse`; the optional `mobKindResolver`
 * lets the scene tell us what kind a given entity was so we award the right XP.
 */
export class DeathSystem implements System<Components> {
  private listener: PlayerDeathListener | null = null;
  private playerDeathFired = false;

  constructor(private readonly mobKindResolver?: (id: number) => MobKind | null) {}

  onPlayerDeath(listener: PlayerDeathListener): void {
    this.listener = listener;
  }

  update(_dt: number, world: World<Components>): void {
    for (const id of world.query(['Health'])) {
      const hp = world.getComponent(id, 'Health');
      if (!hp || hp.current > 0) continue;

      if (world.hasComponent(id, 'Player')) {
        if (!this.playerDeathFired) {
          this.playerDeathFired = true;
          this.listener?.();
        }
        continue; // Don't destroy the player entity here; the scene transition takes over.
      }

      const pos = world.getComponent(id, 'Position');
      const mobKind = this.mobKindResolver?.(id) ?? null;
      const xp = mobKind ? MOBS[mobKind].xp : 0;
      if (pos && xp > 0) {
        spawnFloatingText(world, {
          x: pos.x,
          y: pos.y,
          text: `+${xp} XP`,
          color: 0xffe27a,
          durationMs: 1100,
        });
      }
      world.destroyEntity(id);
    }
  }

  destroy(): void {
    this.listener = null;
    this.playerDeathFired = false;
  }
}
