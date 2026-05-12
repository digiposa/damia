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
      // in TLoD art). 100×130 keeps the native 152×199 ratio (~0.76)
      // close enough while sitting between goblin (60×80) and trent
      // (90×160) in screen presence — visibly a boss without dwarfing
      // the player.
      shape: 'capsule',
      color: 0x5a2a2a,
      width: 100,
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

/**
 * TLoD-canonical addition slugs. The set is shared across all archetypes —
 * only the unlock schedule (`archetype.additionUnlocksByLevel` +
 * `archetype.masterAddition`) decides who can trigger which slug. Shana /
 * Miranda intentionally have no entries here: the White-Silver Dragoon
 * combat loop is auto-attack only.
 */
export type AdditionKind =
  // Red-Eye Dragoon (Dart)
  | 'doubleSlash'
  | 'volcano'
  | 'burningRush'
  | 'crushDance'
  | 'madnessHero'
  | 'moonStrike'
  | 'blazingDynamo'
  // Jade Dragoon (Lavitz / Albert)
  | 'harpoon'
  | 'spinningCane'
  | 'rodTyphoon'
  | 'gustOfWindDance'
  | 'flowerStorm'
  // Dark Burst Dragoon (Rose)
  | 'whipSmack'
  | 'moreAndMore'
  | 'hardBlade'
  | 'demonsDance'
  // Violet Dragoon (Haschel)
  | 'doublePunch'
  | 'flurryOfStyx'
  | 'summon4Gods'
  | 'fiveRingShattering'
  | 'hexHammer'
  | 'omniSweep'
  // Blue-Sea Dragoon (Meru)
  | 'doubleSmack'
  | 'hammerSpin'
  | 'coolBoogie'
  | 'catsCradle'
  | 'perkyStep'
  // Golden Dragoon (Kongol)
  | 'pursuit'
  | 'inferno'
  | 'boneCrush';

/** One row of an addition's level table. Levels run 1..5; addition uses
 *  raise the level every 20 triggers (see `getAdditionLevel`). */
export interface AdditionLevel {
  /** Total damage multiplier across the full sequence (`1.50` = +50 % of
   *  baseAtk over all hits combined). The system splits this evenly per
   *  landing hit at apply time. */
  dmgMul: number;
  /** SP awarded over the full sequence (split per landing hit). */
  spGain: number;
}

export interface AdditionDefinition {
  /** Display name (used by Hotbar tooltip / ActionLog). */
  name: string;
  /** Total animation duration in ms. */
  totalMs: number;
  /** Hit checkpoint timings (ms from start). Damage applies once per entry. */
  hitTimingsMs: readonly number[];
  /** Cooldown in ms, started on trigger. */
  cooldownMs: number;
  /** Per-level (1..5) damage / SP table. Higher levels unlock by use count
   *  (see Progression.additionUses + getAdditionLevel). */
  levels: readonly [AdditionLevel, AdditionLevel, AdditionLevel, AdditionLevel, AdditionLevel];
  /** Optional trigger-range override (defaults to attacker's stats.range). */
  rangeOverridePx?: number;
}

// --- Addition factory --------------------------------------------------------

/** Inter-hit timing inside an addition's animation. Matches the original
 *  Double Slash pacing (~180/380 ms) close enough that legacy behaviour is
 *  preserved while keeping a uniform formula for every multi-hit slug. */
const HIT_INTERVAL_MS = 200;
/** Tail after the last hit before the component is removed. */
const TAIL_MS = 100;
/** Cooldown grows with hit count so master additions can't be spammed. */
const COOLDOWN_BASE_MS = 6000;
const COOLDOWN_PER_EXTRA_HIT_MS = 1500;

function build(opts: {
  name: string;
  /** TLoD's `Add (#)` is the number of timed inputs after the free first
   *  strike. We store the **total** hit count = `Add(#) + 1`. */
  nbHits: number;
  levels: AdditionDefinition['levels'];
  rangeOverridePx?: number;
}): AdditionDefinition {
  const hitTimingsMs = Array.from({ length: opts.nbHits }, (_, i) => (i + 1) * HIT_INTERVAL_MS);
  const totalMs = opts.nbHits * HIT_INTERVAL_MS + TAIL_MS;
  const cooldownMs = COOLDOWN_BASE_MS + Math.max(0, opts.nbHits - 2) * COOLDOWN_PER_EXTRA_HIT_MS;
  return {
    name: opts.name,
    totalMs,
    hitTimingsMs,
    cooldownMs,
    levels: opts.levels,
    ...(opts.rangeOverridePx !== undefined ? { rangeOverridePx: opts.rangeOverridePx } : {}),
  };
}

const L = (dmgMul: number, spGain: number): AdditionLevel => ({ dmgMul, spGain });

export const ADDITIONS: Record<AdditionKind, AdditionDefinition> = {
  // --- Red-Eye Dragoon (Dart) ---------------------------------------------
  doubleSlash: build({
    name: 'Double Slash',
    nbHits: 2,
    levels: [L(1.5, 35), L(1.57, 35), L(1.65, 35), L(1.8, 35), L(2.02, 35)],
  }),
  volcano: build({
    name: 'Volcano',
    nbHits: 4,
    levels: [L(2.0, 20), L(2.1, 24), L(2.2, 28), L(2.3, 32), L(2.5, 36)],
  }),
  burningRush: build({
    name: 'Burning Rush',
    nbHits: 3,
    levels: [L(1.5, 30), L(1.5, 45), L(1.5, 60), L(1.5, 75), L(1.5, 102)],
  }),
  crushDance: build({
    name: 'Crush Dance',
    nbHits: 5,
    levels: [L(1.5, 50), L(1.72, 60), L(1.95, 75), L(2.17, 85), L(2.5, 100)],
  }),
  madnessHero: build({
    name: 'Madness Hero',
    nbHits: 6,
    levels: [L(1.0, 60), L(1.0, 90), L(1.0, 120), L(1.0, 150), L(1.0, 204)],
  }),
  moonStrike: build({
    name: 'Moon Strike',
    nbHits: 7,
    levels: [L(2.0, 20), L(2.4, 20), L(2.8, 20), L(3.2, 20), L(3.5, 20)],
  }),
  blazingDynamo: build({
    name: 'Blazing Dynamo',
    nbHits: 8,
    levels: [L(2.5, 100), L(3.0, 110), L(3.5, 120), L(4.0, 130), L(4.5, 150)],
  }),

  // --- Jade Dragoon (Lavitz / Albert) -------------------------------------
  harpoon: build({
    name: 'Harpoon',
    nbHits: 2,
    levels: [L(1.0, 35), L(1.1, 38), L(1.2, 42), L(1.3, 45), L(1.5, 50)],
  }),
  spinningCane: build({
    name: 'Spinning Cane',
    nbHits: 3,
    levels: [L(1.0, 35), L(1.25, 35), L(1.5, 35), L(1.75, 35), L(2.0, 35)],
  }),
  rodTyphoon: build({
    name: 'Rod Typhoon',
    nbHits: 5,
    levels: [L(1.5, 30), L(1.62, 45), L(1.74, 60), L(1.86, 75), L(2.02, 100)],
  }),
  gustOfWindDance: build({
    name: 'Gust of Wind Dance',
    nbHits: 7,
    levels: [L(2.0, 35), L(2.4, 35), L(2.8, 35), L(3.2, 35), L(3.5, 35)],
  }),
  flowerStorm: build({
    name: 'Flower Storm',
    nbHits: 8,
    levels: [L(3.0, 60), L(3.24, 90), L(3.48, 120), L(3.72, 150), L(4.05, 202)],
  }),

  // --- Dark Burst Dragoon (Rose) ------------------------------------------
  whipSmack: build({
    name: 'Whip Smack',
    nbHits: 2,
    levels: [L(1.0, 35), L(1.25, 35), L(1.5, 35), L(1.75, 35), L(2.0, 35)],
  }),
  moreAndMore: build({
    name: 'More & More',
    nbHits: 3,
    levels: [L(1.5, 30), L(1.5, 45), L(1.5, 60), L(1.5, 75), L(1.5, 102)],
  }),
  hardBlade: build({
    name: 'Hard Blade',
    nbHits: 6,
    levels: [L(1.0, 35), L(1.5, 35), L(2.0, 35), L(2.5, 35), L(3.0, 35)],
  }),
  demonsDance: build({
    name: "Demon's Dance",
    nbHits: 8,
    levels: [L(2.0, 100), L(2.8, 100), L(3.6, 100), L(4.4, 100), L(5.0, 100)],
  }),

  // --- Violet Dragoon (Haschel) -------------------------------------------
  doublePunch: build({
    name: 'Double Punch',
    nbHits: 2,
    levels: [L(1.0, 35), L(1.1, 38), L(1.2, 42), L(1.3, 45), L(1.5, 50)],
  }),
  flurryOfStyx: build({
    name: 'Flurry of Styx',
    nbHits: 3,
    levels: [L(1.5, 20), L(1.62, 20), L(1.74, 20), L(1.86, 20), L(2.02, 20)],
  }),
  summon4Gods: build({
    name: 'Summon 4 Gods',
    nbHits: 4,
    levels: [L(1.0, 50), L(1.0, 61), L(1.0, 75), L(1.0, 86), L(1.0, 100)],
  }),
  fiveRingShattering: build({
    name: '5-Ring Shattering',
    nbHits: 5,
    levels: [L(1.5, 35), L(1.87, 35), L(2.25, 40), L(2.62, 45), L(3.0, 50)],
  }),
  hexHammer: build({
    name: 'Hex Hammer',
    nbHits: 7,
    levels: [L(2.0, 15), L(2.5, 15), L(3.0, 15), L(3.5, 15), L(4.0, 15)],
  }),
  omniSweep: build({
    name: 'Omni-Sweep',
    nbHits: 8,
    levels: [L(3.0, 50), L(3.45, 75), L(3.9, 100), L(4.35, 125), L(5.01, 150)],
  }),

  // --- Blue-Sea Dragoon (Meru) --------------------------------------------
  doubleSmack: build({
    name: 'Double Smack',
    nbHits: 2,
    levels: [L(1.0, 20), L(1.1, 24), L(1.2, 28), L(1.3, 32), L(1.5, 34)],
  }),
  hammerSpin: build({
    name: 'Hammer Spin',
    nbHits: 4,
    levels: [L(1.5, 35), L(1.62, 46), L(1.74, 51), L(1.86, 59), L(2.02, 70)],
  }),
  coolBoogie: build({
    name: 'Cool Boogie',
    nbHits: 5,
    levels: [L(1.0, 60), L(1.0, 90), L(1.0, 120), L(1.0, 150), L(1.0, 200)],
  }),
  catsCradle: build({
    name: "Cat's Cradle",
    nbHits: 7,
    levels: [L(1.5, 20), L(1.95, 20), L(2.4, 20), L(2.85, 20), L(3.51, 20)],
  }),
  perkyStep: build({
    name: 'Perky Step',
    nbHits: 8,
    levels: [L(2.0, 100), L(3.0, 100), L(4.0, 100), L(5.0, 100), L(6.0, 100)],
  }),

  // --- Golden Dragoon (Kongol) --------------------------------------------
  pursuit: build({
    name: 'Pursuit',
    nbHits: 2,
    levels: [L(1.0, 35), L(1.1, 38), L(1.2, 42), L(1.3, 45), L(1.5, 50)],
  }),
  inferno: build({
    name: 'Inferno',
    nbHits: 4,
    levels: [L(1.0, 20), L(1.25, 20), L(1.5, 20), L(1.75, 20), L(2.0, 20)],
  }),
  boneCrush: build({
    name: 'Bone Crush',
    nbHits: 6,
    levels: [L(2.0, 100), L(2.2, 100), L(2.4, 100), L(2.6, 100), L(3.0, 100)],
  }),
};

/**
 * Map an addition's lifetime use count to its current level (1..5). TLoD
 * canon: every 20 successful triggers raises the level by 1, capped at 5
 * (= 80 + uses). A fresh slug starts at level 1 with no uses.
 */
export type AdditionLevelIndex = 1 | 2 | 3 | 4 | 5;
export function getAdditionLevel(uses: number): AdditionLevelIndex {
  if (uses < 20) return 1;
  if (uses < 40) return 2;
  if (uses < 60) return 3;
  if (uses < 80) return 4;
  return 5;
}
