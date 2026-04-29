import type { Sprite, Stats } from '@gameplay/components';

export const COMBAT = {
  /** Damage rolled uniformly in [base - variance, base + variance]. */
  damageVariance: 2,
  /** Multiplier applied to incoming damage while Defending. */
  defendingDamageMul: 0.5,
  /** Hard floor: every successful hit deals at least this much. */
  minDamage: 1,
} as const;

export const PLAYER_BASE = {
  health: 100,
  speed: 0.18,
  stats: { atk: 12, def: 3, magicAtk: 10, atkSpeed: 1.5, range: 80, aggroRange: 0 } as Stats,
} as const;

export type MobKind = 'berserkMouse' | 'goblin' | 'assassinCock' | 'trent';

export interface MobDefinition {
  health: number;
  speed: number;
  stats: Stats;
  sprite: Omit<Sprite, 'layer' | 'scale'>;
  /** XP awarded on kill. */
  xp: number;
}

export const MOBS: Record<MobKind, MobDefinition> = {
  berserkMouse: {
    health: 20,
    speed: 0.12,
    stats: { atk: 5, def: 1, magicAtk: 0, atkSpeed: 1, range: 80, aggroRange: 256 },
    sprite: {
      shape: 'circle',
      color: 0xc77ba0,
      width: 56,
      height: 56,
      fitMode: 'height',
      textureAlias: 'sprite.mob.berserkMouse',
      attackTextureAlias: 'sprite.mob.berserkMouse.attack',
      deathTextureAlias: 'sprite.mob.berserkMouse.death',
    },
    xp: 5,
  },
  goblin: {
    health: 40,
    speed: 0.1,
    stats: { atk: 8, def: 4, magicAtk: 0, atkSpeed: 1, range: 80, aggroRange: 200 },
    sprite: {
      shape: 'capsule',
      color: 0x4a8f3a,
      width: 60,
      height: 80,
      fitMode: 'height',
      textureAlias: 'sprite.mob.goblin',
      attackTextureAlias: 'sprite.mob.goblin.attack',
      deathTextureAlias: 'sprite.mob.goblin.death',
    },
    xp: 12,
  },
  assassinCock: {
    health: 30,
    speed: 0.16,
    stats: { atk: 7, def: 2, magicAtk: 2, atkSpeed: 1.4, range: 96, aggroRange: 320 },
    sprite: {
      shape: 'diamond',
      color: 0x6a3a8f,
      width: 80,
      height: 70,
      fitMode: 'height',
      textureAlias: 'sprite.mob.assassinCock',
      attackTextureAlias: 'sprite.mob.assassinCock.attack',
      deathTextureAlias: 'sprite.mob.assassinCock.death',
    },
    xp: 8,
  },
  trent: {
    health: 50,
    speed: 0.06,
    stats: { atk: 12, def: 6, magicAtk: 4, atkSpeed: 0.5, range: 80, aggroRange: 192 },
    sprite: {
      shape: 'tree',
      color: 0x8a2a2a,
      width: 90,
      height: 160,
      fitMode: 'height',
      textureAlias: 'sprite.mob.trent',
      attackTextureAlias: 'sprite.mob.trent.attack',
      deathTextureAlias: 'sprite.mob.trent.death',
    },
    xp: 15,
  },
} as const;

/**
 * Pure damage formula. Tested in `tests/gameplay/combat.test.ts`.
 * Returns the integer damage dealt (clamped to `COMBAT.minDamage`).
 *
 * `roll` is a [0, 1) random factor (injected for testability).
 * `defending` halves the result before flooring.
 */
export function computeDamage(
  attackerAtk: number,
  defenderDef: number,
  roll: number,
  defending: boolean,
): number {
  const variance = (roll * 2 - 1) * COMBAT.damageVariance;
  let dmg = attackerAtk - defenderDef + variance;
  if (defending) dmg *= COMBAT.defendingDamageMul;
  return Math.max(COMBAT.minDamage, Math.round(dmg));
}

export type AdditionKind = 'doubleSlash';

export interface AdditionDefinition {
  /** Display name (used by Hotbar tooltip / ActionLog later). */
  name: string;
  /** Total animation duration in ms. */
  totalMs: number;
  /** Hit checkpoint timings (ms from start). Damage applies once per entry. */
  hitTimingsMs: readonly number[];
  /** Multiplier applied to the attacker's atk per hit (so total ~= sum of mults × baseDmg). */
  atkMulPerHit: number;
  /** Range (px) at which the addition can be triggered — defaults to attacker's stats.range. */
  rangeOverridePx?: number;
  /** Cooldown in ms, started on trigger. */
  cooldownMs: number;
}

export const ADDITIONS: Record<AdditionKind, AdditionDefinition> = {
  doubleSlash: {
    name: 'Double Slash',
    totalMs: 500,
    hitTimingsMs: [180, 380],
    atkMulPerHit: 0.7,
    cooldownMs: 6000,
  },
};
