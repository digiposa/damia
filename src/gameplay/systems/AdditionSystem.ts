import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { ADDITIONS, computeDamage, type AdditionKind } from '@data/balance';
import { spawnFloatingText } from '@gameplay/entities/floatingText';
import { playSfx } from '@services/AudioManager';

/**
 * Drives Active addition animations and ticks per-skill cooldowns.
 *
 * - For each entity with an `Addition`, advance `elapsedMs`. Each time we cross
 *   a `hitTimingsMs[i]` checkpoint, apply one damage hit to the locked target.
 *   On completion, remove the component (cooldown is *not* reset here — it was
 *   started on trigger so interrupting can't refund it).
 * - For each entity with a `SkillCooldown`, decrement every entry and prune
 *   entries that hit zero so `remainingMs[kind]` returns undefined when ready.
 *
 * Damage uses `computeDamage` with `attackerAtk = round(stats.atk * mul)` so
 * Defending mobs still halve incoming damage like a regular hit.
 */
export class AdditionSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    // Tick cooldowns first so a freshly-triggered addition's CD entry shows up
    // before this system reads it next frame.
    for (const id of world.query(['SkillCooldown'])) {
      const cd = world.getComponent(id, 'SkillCooldown');
      if (!cd) continue;
      for (const k of Object.keys(cd.remainingMs) as AdditionKind[]) {
        const next = (cd.remainingMs[k] ?? 0) - dt;
        if (next <= 0) delete cd.remainingMs[k];
        else cd.remainingMs[k] = next;
      }
    }

    for (const id of world.query(['Addition', 'Stats'])) {
      const add = world.getComponent(id, 'Addition');
      const stats = world.getComponent(id, 'Stats');
      if (!add || !stats) continue;

      const def = ADDITIONS[add.kind];
      const before = add.elapsedMs;
      add.elapsedMs += dt;

      // Apply each hit checkpoint we just crossed (in order, can be > 1 if dt is huge).
      for (let i = add.hitsApplied; i < def.hitTimingsMs.length; i++) {
        const t = def.hitTimingsMs[i];
        if (t === undefined) break;
        if (t > add.elapsedMs) break;
        if (t < before) continue; // shouldn't happen (hitsApplied protects us) but be defensive
        this.applyHit(world, id, add.targetId, stats.atk, def.atkMulPerHit);
        add.hitsApplied = i + 1;
      }

      if (add.elapsedMs >= def.totalMs) {
        world.removeComponent(id, 'Addition');
      }
    }
  }

  private applyHit(
    world: World<Components>,
    _attackerId: number,
    targetId: number,
    attackerAtk: number,
    mul: number,
  ): void {
    const targetHealth = world.getComponent(targetId, 'Health');
    const targetStats = world.getComponent(targetId, 'Stats');
    const targetPos = world.getComponent(targetId, 'Position');
    if (!targetHealth || !targetStats || !targetPos) return;
    if (targetHealth.current <= 0 || world.hasComponent(targetId, 'Dying')) return;

    const defending = world.hasComponent(targetId, 'Defending');
    const dmg = computeDamage(
      Math.max(1, Math.round(attackerAtk * mul)),
      targetStats.def,
      Math.random(),
      defending,
    );
    targetHealth.current = Math.max(0, targetHealth.current - dmg);
    spawnFloatingText(world, {
      x: targetPos.x,
      y: targetPos.y,
      text: String(dmg),
      color: defending ? 0x9bb6ff : 0xffd166,
    });
    playSfx('combat.hit');
  }
}
