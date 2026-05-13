import type { System, World } from '@core/ecs';
import { worldToGrid } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { computePhysicalDamage } from '@gameplay/damage';
import { FLOAT_DAMAGE, spawnFloatingText } from '@gameplay/entities/floatingText';
import { spawnProjectile } from '@gameplay/entities/projectile';
import { addSp } from '@gameplay/sp';
import { effectiveAtk } from '@gameplay/stats';
import { playSfx } from '@services/AudioManager';

const TARGET_RECHECK_MS = 100;

/**
 * Drives entities that have CombatIntent:
 * - If target out of range → set Pathfinder to chase (rate-limited refresh).
 * - If target in range → stop moving and attack on cooldown.
 * - Cleans intent if target is dead/destroyed.
 */
export class CombatSystem implements System<Components> {
  private lastTargetRecheckMs = new Map<number, number>();
  private elapsedMs = 0;

  update(dt: number, world: World<Components>): void {
    this.elapsedMs += dt;

    for (const id of world.query(['CombatIntent', 'Stats', 'Position', 'AttackCooldown'])) {
      // Don't fire regular swings while a skill / spell animation is playing —
      // the Addition / Spell pipelines own the attacker for their duration.
      if (world.hasComponent(id, 'Addition')) continue;
      if (world.hasComponent(id, 'Spell')) continue;
      // Defenders are committed: no chase, no swing for the lock-in window.
      // The scene heals + adds the Defending component; DefenseSystem owns
      // the timer and removes it on expiry. Skipping CombatSystem entirely
      // here is what stops Dart from creeping toward the target while
      // defending.
      if (world.hasComponent(id, 'Defending')) continue;
      const intent = world.getComponent(id, 'CombatIntent');
      const stats = world.getComponent(id, 'Stats');
      const pos = world.getComponent(id, 'Position');
      const cd = world.getComponent(id, 'AttackCooldown');
      if (!intent || !stats || !pos || !cd) continue;

      const targetHealth = world.getComponent(intent.targetId, 'Health');
      const targetPos = world.getComponent(intent.targetId, 'Position');
      const targetStats = world.getComponent(intent.targetId, 'Stats');

      // Target gone, dead, or playing a death animation.
      if (
        !targetHealth ||
        !targetPos ||
        !targetStats ||
        targetHealth.current <= 0 ||
        world.hasComponent(intent.targetId, 'Dying')
      ) {
        world.removeComponent(id, 'CombatIntent');
        this.lastTargetRecheckMs.delete(id);
        continue;
      }

      const dx = targetPos.x - pos.x;
      const dy = targetPos.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > stats.range) {
        // Not in range — request a path refresh, throttled to avoid spamming easystar.
        const last = this.lastTargetRecheckMs.get(id) ?? -Infinity;
        if (this.elapsedMs - last >= TARGET_RECHECK_MS) {
          this.lastTargetRecheckMs.set(id, this.elapsedMs);
          const pf = world.getComponent(id, 'Pathfinder');
          if (pf) {
            const grid = worldToGrid(targetPos.x, targetPos.y);
            const tgx = Math.round(grid.x);
            const tgy = Math.round(grid.y);
            if (!pf.targetGrid || pf.targetGrid.gx !== tgx || pf.targetGrid.gy !== tgy) {
              pf.targetGrid = { gx: tgx, gy: tgy };
              pf.waypoints = null;
              pf.computing = false;
            }
          }
        }
        continue;
      }

      // In range — stop and attack on cooldown.
      const pf = world.getComponent(id, 'Pathfinder');
      if (pf) {
        pf.waypoints = null;
        pf.targetGrid = null;
      }

      if (cd.remainingMs > 0) continue;

      // Branch on the attacker's CharacterDef.attackPattern when
      // present. Mobs have no Character component → fall through to
      // melee, preserving the legacy behaviour.
      const character = world.getComponent(id, 'Character');
      const pattern = character?.avatar.archetype.attackPattern ?? 'melee';
      const len = Math.hypot(dx, dy) || 1;
      const dirX = dx / len;
      const dirY = dy / len;

      if (pattern === 'ranged') {
        // Ranged: spawn an arrow projectile heading toward the current
        // target. ProjectileSystem applies damage on collision (it
        // also picks the actual hit target, which may be any enemy
        // along the line — handy when the arc passes through a swarm).
        // Spawn point is offset along the firing direction so the
        // arrow doesn't immediately collide with the player's own
        // hit radius. Faction lookup is safe: Faction was added on
        // spawn for every Player/Mob.
        const fac = world.getComponent(id, 'Faction');
        const spawnOffsetPx = 22;
        // Snapshot AT + LV at fire time for the TLoD Archer Attack
        // formula. The arrow can outlive the player's current state
        // (level-up, form exit, etc.) so the projectile carries its
        // own damage inputs.
        const prog = world.getComponent(id, 'Progression');
        spawnProjectile(world, {
          sourceId: id,
          sourceFaction: fac?.side ?? 'player',
          x: pos.x + dirX * spawnOffsetPx,
          y: pos.y + dirY * spawnOffsetPx,
          dirX,
          dirY,
          attackerAt: effectiveAtk(world, id),
          attackerLv: prog?.level ?? 1,
        });
        cd.remainingMs = 1000 / Math.max(0.1, stats.atkSpeed);
        // AttackSwing still drives the bow-draw pose visually: a brief
        // sprite-swap to the attack texture even though no melee lunge
        // happens. Direction stored so the pose orientates correctly
        // when RenderSystem grows side-facing logic later.
        world.addComponent(id, 'AttackSwing', {
          elapsedMs: 0,
          totalMs: 260,
          dirX,
          dirY,
        });
        playSfx('combat.swing');
        // Auto-attack SP gain (ranged archetypes only — melee
        // ones use Additions instead, see AdditionSystem).
        if (character) {
          addSp(world, id, character.avatar.archetype.dragoon.spGainPerAutoAttack);
        }
        continue;
      }

      // Melee: immediate damage on the locked target + visual lunge.
      // computePhysicalDamage dispatches on the attacker's class —
      // Player Archer Attack formula vs Enemy Physical, both reading
      // effective stats through gameplay/stats.ts so Dragoon-form
      // boosts apply automatically. Defending (Guard) goes through
      // the formula's modifier wrapper.
      const dmg = computePhysicalDamage(world, id, intent.targetId);
      targetHealth.current = Math.max(0, targetHealth.current - dmg);
      cd.remainingMs = 1000 / Math.max(0.1, stats.atkSpeed);

      spawnFloatingText(world, {
        x: targetPos.x,
        y: targetPos.y,
        text: String(dmg),
        color: FLOAT_DAMAGE,
      });

      // Visual lunge: store unit-vector toward target so RenderSystem can
      // offset the attacker's sprite forward then back over `totalMs`.
      world.addComponent(id, 'AttackSwing', {
        elapsedMs: 0,
        totalMs: 220,
        dirX,
        dirY,
      });

      playSfx('combat.swing');
      playSfx('combat.hit');
      // Auto-attack SP gain (no-op for Dart-style melee archetypes
      // whose spGainPerAutoAttack is 0 — they gain via Additions).
      if (character) {
        addSp(world, id, character.avatar.archetype.dragoon.spGainPerAutoAttack);
      }
    }
  }

  destroy(): void {
    this.lastTargetRecheckMs.clear();
  }
}
