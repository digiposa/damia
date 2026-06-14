import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { computePhysicalDamage } from '@gameplay/damage';
import { rollHit, spawnMissText } from '@gameplay/hit';
import { FLOAT_DAMAGE, spawnFloatingText } from '@gameplay/entities/floatingText';
import { playSfx } from '@services/AudioManager';

/**
 * Ticks `MobMultiSwing` components (boss-special multi-hit swings, see
 * `MobMultiSwing.ts`). Applies the Enemy Physical formula per hit at
 * each checkpoint — same path as CombatSystem's regular melee swing,
 * not the player-calibrated addition formula — and rolls a single
 * precision/avoid check at trigger time (matching `AdditionSystem`'s
 * sequence-level miss semantics).
 *
 * v1 user: Commander Seles' post-PowerUp Slash Twice (2 hits × 1×
 * physical = ~2× total per canon).
 */
export class MobMultiSwingSystem implements System<Components> {
  /** Per-entity flag: did the trigger-time miss roll fail? Mirrors
   *  `Addition.missed` — kept off the component because the v1 user
   *  always lands the first roll at the boss's hit rate, but the path
   *  is here for parity with the player Addition flow. */
  private readonly missed = new Set<number>();

  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['MobMultiSwing'])) {
      const swing = world.getComponent(id, 'MobMultiSwing');
      if (!swing) continue;

      const before = swing.elapsedMs;
      swing.elapsedMs += dt;

      // Roll precision once at the first frame so a 2-hit swing reads
      // as one decision (you either landed Slash Twice or you didn't),
      // mirroring AdditionSystem's sequence-level miss.
      if (before === 0 && !this.missed.has(id)) {
        if (!rollHit(world, id, swing.targetId, 'attack')) {
          this.missed.add(id);
          const targetPos = world.getComponent(swing.targetId, 'Position');
          if (targetPos) spawnMissText(world, targetPos.x, targetPos.y);
        }
      }

      // Apply every checkpoint we crossed this tick (handles huge dt
      // safely, same as AdditionSystem).
      for (let i = swing.hitsApplied; i < swing.hitTimingsMs.length; i++) {
        const t = swing.hitTimingsMs[i];
        if (t === undefined) break;
        if (t > swing.elapsedMs) break;
        swing.hitsApplied = i + 1;
        if (this.missed.has(id)) continue;
        this.applyHit(world, id, swing.targetId, swing.perHitMultiplier);
      }

      if (swing.elapsedMs >= swing.totalMs) {
        this.missed.delete(id);
        world.removeComponent(id, 'MobMultiSwing');
      }
    }
  }

  private applyHit(
    world: World<Components>,
    attackerId: number,
    targetId: number,
    perHitMultiplier: number,
  ): void {
    const targetHealth = world.getComponent(targetId, 'Health');
    const targetPos = world.getComponent(targetId, 'Position');
    if (!targetHealth || !targetPos) return;
    if (targetHealth.current <= 0 || world.hasComponent(targetId, 'Dying')) return;

    const base = computePhysicalDamage(world, attackerId, targetId);
    const dmg = Math.max(1, Math.round(base * perHitMultiplier));
    targetHealth.current = Math.max(0, targetHealth.current - dmg);
    spawnFloatingText(world, {
      x: targetPos.x,
      y: targetPos.y,
      text: String(dmg),
      color: FLOAT_DAMAGE,
    });
    playSfx('combat.hit');
  }

  destroy(): void {
    this.missed.clear();
  }
}
