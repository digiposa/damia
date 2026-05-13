import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { COMBAT } from '@data/balance';
import { FLOAT_DAMAGE, spawnFloatingText } from '@gameplay/entities/floatingText';
import { effectiveDef } from '@gameplay/stats';
import { playSfx } from '@services/AudioManager';

/**
 * Advances every in-flight `Projectile` entity along its stored
 * direction, checks for collision against opposing-faction entities,
 * applies damage on hit, despawns. Hard-life cap stops orphaned
 * arrows from accumulating off-camera.
 *
 * Ticks after `MovementSystem` so target positions are already
 * resolved for the current frame, and before `DeathSystem` so a
 * killing-blow arrow correctly drops mobs into the dying pipeline.
 * The controller's systems pipeline owns the ordering — see
 * GameplayController.ts for the canonical sequence.
 */
export class ProjectileSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['Projectile', 'Position'])) {
      const proj = world.getComponent(id, 'Projectile');
      const pos = world.getComponent(id, 'Position');
      if (!proj || !pos) continue;

      // Advance + age. Done before collision so the very first tick
      // doesn't sit inside the source's hit radius.
      pos.x += proj.dirX * proj.speedPxPerMs * dt;
      pos.y += proj.dirY * proj.speedPxPerMs * dt;
      proj.elapsedMs += dt;
      if (proj.elapsedMs >= proj.maxLifeMs) {
        world.destroyEntity(id);
        continue;
      }

      // Find the first opposing-faction entity within hit radius.
      // Single-target hit on first match — VS-style pierce can plug
      // in later by iterating the whole list with a `pierces` counter.
      const oppositeSide = proj.sourceFaction === 'player' ? 'enemy' : 'player';
      let hitId: number | null = null;
      let hitDist = Infinity;
      for (const candidate of world.query(['Faction', 'Position', 'Health'])) {
        if (candidate === proj.sourceId) continue;
        if (world.hasComponent(candidate, 'Dying')) continue;
        const fac = world.getComponent(candidate, 'Faction');
        if (!fac || fac.side !== oppositeSide) continue;
        const cPos = world.getComponent(candidate, 'Position');
        const cHp = world.getComponent(candidate, 'Health');
        if (!cPos || !cHp || cHp.current <= 0) continue;
        const d = Math.hypot(cPos.x - pos.x, cPos.y - pos.y);
        if (d <= proj.hitRadiusPx && d < hitDist) {
          hitId = candidate;
          hitDist = d;
        }
      }
      if (hitId === null) continue;

      // Resolve damage using TLoD's player Archer Attack formula
      //   round[AT × (LV+5) × 5 / DF]
      // with attacker AT + LV snapshotted at fire time on the
      // projectile (the source may have leveled up / left form / died
      // between fire and impact). Guard modifier applies via the
      // Defending check; floor at COMBAT.minDamage for UX.
      const tStats = world.getComponent(hitId, 'Stats');
      const tHp = world.getComponent(hitId, 'Health');
      if (!tStats || !tHp) {
        // Edge case: target lost its Stats/Health between query + read.
        // Despawn the arrow anyway so it doesn't pile up.
        world.destroyEntity(id);
        continue;
      }
      const defending = world.hasComponent(hitId, 'Defending');
      const def = Math.max(1, effectiveDef(world, hitId));
      let raw = Math.floor((proj.attackerAt * (proj.attackerLv + 5) * 5 + def / 2) / def);
      if (defending) raw = Math.floor(raw * COMBAT.defendingDamageMul);
      const dmg = Math.max(COMBAT.minDamage, raw);
      tHp.current = Math.max(0, tHp.current - dmg);
      spawnFloatingText(world, {
        x: pos.x,
        y: pos.y,
        text: String(dmg),
        color: FLOAT_DAMAGE,
      });
      playSfx('combat.hit');
      world.destroyEntity(id);
    }
  }
}
