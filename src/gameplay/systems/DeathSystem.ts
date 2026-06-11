import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { FLOAT_XP, spawnFloatingText } from '@gameplay/entities/floatingText';
import { spawnItem } from '@gameplay/entities/items';
import { MOBS, type MobKind } from '@data/balance';
import { rollLoot } from '@data/items';
import { xpToReachLevel } from '@data/characters';
import { applyLevelStats } from '@gameplay/stats';
import { playSfx } from '@services/AudioManager';

export type PlayerDeathListener = () => void;
export type MobDeathListener = (kind: MobKind) => void;
export type PlayerLevelUpListener = (level: number) => void;

export interface DeathSystemOptions {
  mobKindResolver?: (id: number) => MobKind | null;
  /** When false, the system fires `onMobDeath` but does NOT touch the
   *  player's `Progression` component or apply Dart's stat row. Survival
   *  needs this: it runs its own per-run XP curve in `RunState`, and
   *  letting Story's level-up logic also tick would (a) heal the player
   *  to full at every Story-level threshold (~LV 2 at 20 XP) and (b)
   *  inflate Dart's stats mid-run. Defaults to true so Story zones keep
   *  the TLoD-canonical Progression behaviour. */
  awardPlayerXp?: boolean;
}

/**
 * Sweeps entities at or below 0 HP. Players trigger Game Over (via listener).
 * Other entities are destroyed and yield XP + a chance for a loot drop.
 *
 * `mobKindResolver` is provided by the scene so we know what XP value / loot
 * table to use per mob.
 */
export class DeathSystem implements System<Components> {
  private listener: PlayerDeathListener | null = null;
  private mobListener: MobDeathListener | null = null;
  private levelUpListener: PlayerLevelUpListener | null = null;
  private playerDeathFired = false;
  private readonly mobKindResolver: ((id: number) => MobKind | null) | undefined;
  private readonly awardPlayerXp: boolean;

  constructor(options?: DeathSystemOptions | ((id: number) => MobKind | null)) {
    // Back-compat: legacy callers passed the resolver function directly.
    // Keep that path working so we don't have to touch every scene at once.
    if (typeof options === 'function') {
      this.mobKindResolver = options;
      this.awardPlayerXp = true;
    } else {
      this.mobKindResolver = options?.mobKindResolver;
      this.awardPlayerXp = options?.awardPlayerXp ?? true;
    }
  }

  onPlayerDeath(listener: PlayerDeathListener): void {
    this.listener = listener;
  }

  /** Notification fired exactly once per mob death — Survival's
   *  RunState reads this to count kills and route XP into the
   *  per-run level curve. */
  onMobDeath(listener: MobDeathListener): void {
    this.mobListener = listener;
  }

  /** Notification fired once per player level-up (multiple times on
   *  the same frame if a single XP gain crosses several thresholds).
   *  Fires AFTER the Dart row + full heal have been applied, so scene
   *  hooks can layer their own bonuses on top (e.g. Survival's
   *  LevelUpChoiceModal upgrade re-application). No-op when
   *  awardPlayerXp is false (mob kills don't level the player). */
  onPlayerLevelUp(listener: PlayerLevelUpListener): void {
    this.levelUpListener = listener;
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
        continue;
      }

      // Skip entities already converted to a Dying state (DyingSystem owns them).
      if (world.hasComponent(id, 'Dying')) continue;

      const pos = world.getComponent(id, 'Position');
      const mobKind = this.mobKindResolver?.(id) ?? null;
      if (mobKind) this.mobListener?.(mobKind);
      if (pos && mobKind) {
        const xp = MOBS[mobKind].xp;
        if (xp > 0) {
          spawnFloatingText(world, {
            x: pos.x,
            y: pos.y,
            text: `+${xp} XP`,
            color: FLOAT_XP,
            durationMs: 1100,
          });
          if (this.awardPlayerXp) this.awardXp(world, xp, pos.x, pos.y);
        }
        const loot = rollLoot(Math.random(), Math.random());
        if (loot) {
          spawnItem(world, loot, pos.x, pos.y);
        }
      }
      playSfx('combat.death');

      // If the mob has a death sprite, defer destruction so the death-pose
      // texture lingers — DyingSystem cleans it up after the timer. Freeze the
      // entity by stripping anything that would still drive it (AI / pathing /
      // swing / pending intents) and zeroing velocity.
      const sprite = world.getComponent(id, 'Sprite');
      if (sprite?.deathTextureAlias) {
        if (world.hasComponent(id, 'AI')) world.removeComponent(id, 'AI');
        if (world.hasComponent(id, 'Pathfinder')) world.removeComponent(id, 'Pathfinder');
        if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
        if (world.hasComponent(id, 'AttackSwing')) world.removeComponent(id, 'AttackSwing');
        if (world.hasComponent(id, 'Defending')) world.removeComponent(id, 'Defending');
        world.addComponent(id, 'Dying', { elapsedMs: 0, totalMs: 700 });
        continue;
      }

      world.destroyEntity(id);
    }
  }

  destroy(): void {
    this.listener = null;
    this.mobListener = null;
    this.playerDeathFired = false;
  }

  /**
   * Add XP to the player's Progression and consume as many level-ups as the
   * total covers. Level-up: full HP heal (TLoD convention) + floating text.
   * No-op if there's no player or no Progression.
   */
  private awardXp(world: World<Components>, xp: number, mobX: number, mobY: number): void {
    const players = world.query(['Player', 'Progression', 'Character']);
    const playerId = players[0];
    if (playerId === undefined) return;
    const prog = world.getComponent(playerId, 'Progression');
    const character = world.getComponent(playerId, 'Character');
    if (!prog || !character) return;
    const archetype = character.avatar.archetype;
    prog.xp += xp;
    const cap = archetype.xpToReachLevel.length;
    // TLoD model: xp accumulates lifelong. We level up while the cumulative
    // counter crosses the threshold for the next level. xpToNext stays the
    // cumulative threshold (NOT a delta).
    while (prog.level < cap && prog.xp >= prog.xpToNext) {
      prog.level += 1;
      prog.xpToNext = xpToReachLevel(archetype, prog.level + 1);
      // Canon TLoD level-up: archetype row reset → equipment bonuses
      // re-applied on top → full heal. Same helper feeds the training
      // mode level slider + the Forest zone-enter sync, so the three
      // paths can never drift.
      applyLevelStats(world, playerId, prog.level);
      spawnFloatingText(world, {
        x: mobX,
        y: mobY - 30,
        text: `LV ${prog.level}!`,
        color: 0xffd166,
        durationMs: 1400,
      });
      playSfx('items.pickup');
      // Fire AFTER the Dart row + heal so listeners observe the new
      // canonical stats and can layer their own modifiers on top
      // (Survival's run-upgrade re-application path).
      this.levelUpListener?.(prog.level);
    }
  }
}
