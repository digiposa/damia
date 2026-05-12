import type { Sprite, Stats } from '@gameplay/components';

export const COMBAT = {
  /** Damage rolled uniformly in [base - variance, base + variance]. */
  damageVariance: 2,
  /** Multiplier applied to incoming damage while Defending. */
  defendingDamageMul: 0.5,
  /** Hard floor: every successful hit deals at least this much. */
  minDamage: 1,
} as const;

/** Defend stance tuning. Activating defend locks the player in place for
 *  `DEFEND_DURATION_MS`, heals `DEFEND_HEAL_FRAC` of max HP at the moment
 *  of the block, and starts a `DEFEND_COOLDOWN_MS` cooldown (the lock-in
 *  duration counts toward the cooldown). The cooldown lives on
 *  `InputController` so it survives independently of any one entity's
 *  state — keep the values in sync there. */
export const DEFEND = {
  durationMs: 3_000,
  cooldownMs: 10_000,
  healFrac: 0.1,
} as const;

export const PLAYER_BASE = {
  health: 100,
  speed: 0.18,
  stats: {
    atk: 12,
    def: 3,
    magicAtk: 10,
    magicDef: 3,
    speed: 50,
    attackHit: 100,
    magicHit: 100,
    attackAvoid: 0,
    magicAvoid: 0,
    atkSpeed: 1.5,
    range: 80,
    aggroRange: 0,
  } as Stats,
} as const;

export type MobKind = 'berserkMouse' | 'goblin' | 'assassinCock' | 'trent' | 'fruegel';

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
    stats: {
      atk: 5,
      def: 1,
      magicAtk: 0,
      magicDef: 1,
      speed: 60,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 0,
      atkSpeed: 1,
      range: 80,
      aggroRange: 256,
    },
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
    stats: {
      atk: 8,
      def: 4,
      magicAtk: 0,
      magicDef: 2,
      speed: 45,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
      atkSpeed: 1,
      range: 80,
      aggroRange: 200,
    },
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
    stats: {
      atk: 7,
      def: 2,
      magicAtk: 2,
      magicDef: 2,
      speed: 70,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 10,
      magicAvoid: 0,
      atkSpeed: 1.4,
      range: 96,
      aggroRange: 320,
    },
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
    stats: {
      atk: 12,
      def: 6,
      magicAtk: 4,
      magicDef: 5,
      speed: 25,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 5,
      atkSpeed: 0.5,
      range: 80,
      aggroRange: 192,
    },
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
  // BOSS — Fruegel, Hellena Prison's warden. Numbers are TLoD-canonical
  // (1st visit, US/EU column): high physical defence + middling damage,
  // designed in the original to be brutally tanky for the player's first
  // proper boss. Action-RPG translation: melee swing every ~1.5 s, world
  // speed slow enough that the player can kite. We keep aggroRange tiny
  // here because the WaveSpawnerSystem overrides it to 99 999 on spawn —
  // bosses are pre-engaged so they march on the player from across the
  // arena instead of idling.
  fruegel: {
    health: 90,
    speed: 0.05,
    stats: {
      atk: 6,
      def: 100,
      magicAtk: 4,
      magicDef: 80,
      speed: 50,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
      atkSpeed: 0.7,
      range: 96,
      aggroRange: 200,
    },
    sprite: {
      // Humanoid silhouette — wider than goblin (he's a hulking warden
      // in TLoD art). Placeholder textures resolve to the trent sprite
      // via AssetManager until the dedicated PNG is uploaded.
      shape: 'capsule',
      color: 0x5a2a2a,
      width: 90,
      height: 130,
      fitMode: 'height',
      textureAlias: 'sprite.mob.fruegel',
      attackTextureAlias: 'sprite.mob.fruegel.attack',
      deathTextureAlias: 'sprite.mob.fruegel.death',
    },
    xp: 240,
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
