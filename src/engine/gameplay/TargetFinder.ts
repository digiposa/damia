import type { Entity, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';

/** Click-pick radius (world px) for the attack cursor / tap-to-attack —
 *  how close to an enemy a click must land to count as targeting it. */
const ENEMY_PICK_RADIUS_PX = 96;

/**
 * Enemy target resolution for the gameplay controller — the "which mob
 * does this click / cast / addition hit?" queries, pulled out of
 * GameplayController so the picking rules live in one cohesive place.
 *
 * Pure read-only over the ECS world: every method scans live components
 * and returns an entity id (or null). Distances are compared squared
 * (never displayed) so the scans stay sqrt-free.
 */
export class TargetFinder {
  constructor(
    private readonly world: World<Components>,
    private readonly getPlayerId: () => Entity | null,
  ) {}

  /** Nearest living, visible enemy to a grid cell, within pick radius. */
  findEnemyAtCell(gx: number, gy: number): Entity | null {
    const target = gridToWorld(gx, gy);
    return this.findEnemyAtWorld(target.x, target.y);
  }

  /** Nearest living, visible enemy to a world point, within pick radius. */
  findEnemyAtWorld(wx: number, wy: number): Entity | null {
    let best: Entity | null = null;
    // Squared distances throughout — this runs every frame for the
    // attack-cursor hover, and we only ever compare, never display, the
    // value, so the sqrt in Math.hypot is pure waste here.
    let bestDistSq = ENEMY_PICK_RADIUS_PX * ENEMY_PICK_RADIUS_PX;
    for (const id of this.world.query(['Faction', 'Position', 'Health'])) {
      if (this.world.hasComponent(id, 'Dying')) continue;
      if (this.world.hasComponent(id, 'Hidden')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      const pos = this.world.getComponent(id, 'Position');
      const hp = this.world.getComponent(id, 'Health');
      if (!fac || !pos || !hp || fac.side === 'player' || hp.current <= 0) continue;
      const dx = pos.x - wx;
      const dy = pos.y - wy;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        best = id;
      }
    }
    return best;
  }

  /** Range-agnostic target picker for spell items: always cast on the
   *  active CombatIntent target when it's alive, else the nearest visible
   *  enemy. */
  pickSpellTarget(px: number, py: number): Entity | null {
    const playerId = this.getPlayerId();
    if (playerId === null) return null;
    const intent = this.world.getComponent(playerId, 'CombatIntent');
    if (intent !== undefined) {
      const th = this.world.getComponent(intent.targetId, 'Health');
      if (
        th &&
        th.current > 0 &&
        !this.world.hasComponent(intent.targetId, 'Dying') &&
        !this.world.hasComponent(intent.targetId, 'Hidden')
      ) {
        return intent.targetId;
      }
    }
    let bestId: Entity | null = null;
    let bestDistSq = Infinity;
    for (const id of this.world.query(['Health', 'Position', 'Faction'])) {
      if (id === playerId) continue;
      if (this.world.hasComponent(id, 'Dying')) continue;
      if (this.world.hasComponent(id, 'Hidden')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const pos = this.world.getComponent(id, 'Position');
      const hp = this.world.getComponent(id, 'Health');
      if (!pos || !hp || hp.current <= 0) continue;
      const dx = pos.x - px;
      const dy = pos.y - py;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestId = id;
      }
    }
    return bestId;
  }

  /** Range-bounded target picker for additions (explicitly limited
   *  skills). Prefers the current CombatIntent if it's still in range. */
  pickAdditionTarget(px: number, py: number, range: number): Entity | null {
    const playerId = this.getPlayerId();
    if (playerId === null) return null;
    const rangeSq = range * range;
    const intent = this.world.getComponent(playerId, 'CombatIntent');
    if (intent !== undefined) {
      const tp = this.world.getComponent(intent.targetId, 'Position');
      const th = this.world.getComponent(intent.targetId, 'Health');
      if (
        tp &&
        th &&
        th.current > 0 &&
        !this.world.hasComponent(intent.targetId, 'Dying') &&
        (tp.x - px) ** 2 + (tp.y - py) ** 2 <= rangeSq
      ) {
        return intent.targetId;
      }
    }
    let bestId: Entity | null = null;
    let bestDistSq = Infinity;
    for (const id of this.world.query(['Health', 'Position', 'Faction'])) {
      if (id === playerId) continue;
      if (this.world.hasComponent(id, 'Dying')) continue;
      if (this.world.hasComponent(id, 'Hidden')) continue;
      const fac = this.world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      const tp = this.world.getComponent(id, 'Position');
      if (!tp) continue;
      const distSq = (tp.x - px) ** 2 + (tp.y - py) ** 2;
      if (distSq <= rangeSq && distSq < bestDistSq) {
        bestDistSq = distSq;
        bestId = id;
      }
    }
    return bestId;
  }
}
