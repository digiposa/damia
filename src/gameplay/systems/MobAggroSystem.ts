import type { Entity, System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

/**
 * Minimal aggro for M4: any enemy without a CombatIntent picks the nearest
 * player within its `aggroRange`. M5 will replace this with per-mob behaviors
 * (kite, charge, retreat at low HP, etc.).
 */
export class MobAggroSystem implements System<Components> {
  update(_dt: number, world: World<Components>): void {
    const players = world.query(['Player', 'Position']);
    if (players.length === 0) return;

    for (const id of world.query(['Faction', 'Stats', 'Position', 'AttackCooldown'])) {
      if (world.hasComponent(id, 'CombatIntent')) continue;
      const fac = world.getComponent(id, 'Faction');
      if (!fac || fac.side !== 'enemy') continue;
      const stats = world.getComponent(id, 'Stats');
      const pos = world.getComponent(id, 'Position');
      if (!stats || !pos || stats.aggroRange <= 0) continue;

      let bestId: Entity | null = null;
      let bestDist = Infinity;
      for (const pid of players) {
        const ppos = world.getComponent(pid, 'Position');
        if (!ppos) continue;
        const d = Math.hypot(ppos.x - pos.x, ppos.y - pos.y);
        if (d < bestDist && d <= stats.aggroRange) {
          bestDist = d;
          bestId = pid;
        }
      }
      if (bestId !== null) {
        world.addComponent(id, 'CombatIntent', { targetId: bestId });
      }
    }
  }
}
