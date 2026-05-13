import type { System, World } from '@core/ecs';
import type { Components, Position } from '@gameplay/components';
import { computeDamage } from '@data/balance';
import { FLOAT_DAMAGE, spawnFloatingText } from '@gameplay/entities/floatingText';
import { spawnVfx } from '@gameplay/entities/vfx';
import { effectiveDef, effectiveMagicAtk } from '@gameplay/stats';
import { playSfx } from '@services/AudioManager';

/**
 * Drives Active spell-casts. Per tick:
 *  1. Advance `elapsedMs` by `dt`.
 *  2. The frame `elapsedMs` crosses `hitTimingMs`, apply damage:
 *      - lockedTarget → single hit on `targetId`
 *      - groundAoE    → hit every enemy whose Position is within `aoeRadiusPx`
 *        of (targetX, targetY).
 *  3. When `elapsedMs >= totalMs`, remove the component.
 *
 * Damage = `computeDamage(magicAtk * mul, defender.def, roll, defending)`. We
 * reuse the physical damage helper because the formula shape (atk - def +
 * variance, halved by Defending, clamped to minDamage) is identical for now;
 * elemental multipliers will plug in here later when Element ships.
 */
export class SpellSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['Spell', 'Stats'])) {
      const spell = world.getComponent(id, 'Spell');
      const stats = world.getComponent(id, 'Stats');
      if (!spell || !stats) continue;

      const before = spell.elapsedMs;
      spell.elapsedMs += dt;

      if (!spell.hitApplied && before < spell.hitTimingMs && spell.elapsedMs >= spell.hitTimingMs) {
        this.applyDamage(world, spell, effectiveMagicAtk(world, id));
        spell.hitApplied = true;
      }

      if (spell.elapsedMs >= spell.totalMs) {
        world.removeComponent(id, 'Spell');
      }
    }
  }

  private applyDamage(
    world: World<Components>,
    spell: Components['Spell'],
    magicAtk: number,
  ): void {
    const baseAtk = Math.max(1, Math.round(magicAtk * spell.magicAtkMul));
    if (spell.target === 'lockedTarget') {
      if (spell.targetId === undefined) return;
      const tp = world.getComponent(spell.targetId, 'Position');
      this.hit(world, spell.targetId, baseAtk);
      // Spawn the impact VFX at the target's position (after hit so it overlays
      // the floating-text that hit() may have just spawned).
      if (tp) spawnVfx(world, { kind: spell.vfxKind, x: tp.x, y: tp.y, radius: spell.vfxRadiusPx });
      return;
    }
    if (
      spell.targetX === undefined ||
      spell.targetY === undefined ||
      spell.aoeRadiusPx === undefined
    ) {
      return;
    }
    const r2 = spell.aoeRadiusPx * spell.aoeRadiusPx;
    for (const id of world.query(['Health', 'Position', 'Faction'])) {
      const fac = world.getComponent(id, 'Faction');
      if (!fac || fac.side === 'player') continue;
      if (world.hasComponent(id, 'Dying')) continue;
      const p = world.getComponent(id, 'Position');
      if (!p) continue;
      const dx = p.x - spell.targetX;
      const dy = p.y - spell.targetY;
      if (dx * dx + dy * dy > r2) continue;
      this.hit(world, id, baseAtk);
    }
    // Single big burst at the AoE center — covers the whole damage radius.
    spawnVfx(world, {
      kind: spell.vfxKind,
      x: spell.targetX,
      y: spell.targetY,
      radius: spell.vfxRadiusPx,
      durationMs: 800,
    });
  }

  private hit(world: World<Components>, targetId: number, atk: number): void {
    const hp = world.getComponent(targetId, 'Health');
    const stats = world.getComponent(targetId, 'Stats');
    const pos: Position | undefined = world.getComponent(targetId, 'Position');
    if (!hp || !stats || !pos) return;
    if (hp.current <= 0 || world.hasComponent(targetId, 'Dying')) return;
    const defending = world.hasComponent(targetId, 'Defending');
    const dmg = computeDamage(atk, effectiveDef(world, targetId), Math.random(), defending);
    hp.current = Math.max(0, hp.current - dmg);
    spawnFloatingText(world, {
      x: pos.x,
      y: pos.y,
      text: String(dmg),
      color: FLOAT_DAMAGE,
    });
    playSfx('combat.hit');
  }
}
