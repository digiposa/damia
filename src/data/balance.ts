import type { Sprite, Stats } from '@gameplay/components';
import type { Element } from './elements';

export const COMBAT = {
  /** Multiplier applied to incoming damage while Defending — TLoD's
   *  Guard modifier in the damage doc, applied inside the modifier
   *  wrapper of every formula in `gameplay/damage.ts`. */
  defendingDamageMul: 0.5,
  /** Hard floor: every successful hit deals at least this much.
   *  Also enforced inside `gameplay/damage.ts` as a UX safety so
   *  formulas can't print "0 dmg" floating numbers. */
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

export type MobKind =
  | 'berserkMouse'
  | 'goblin'
  | 'assassinCock'
  | 'trent'
  | 'fruegel'
  | 'knightOfSandoraSeles'
  | 'knightOfSandoraKazas'
  | 'commanderSeles';

/**
 * Action-RPG translation knobs applied at spawn time to the canon JP
 * values in MOBS / SPELLS / ADDITIONS. The tables themselves stay
 * canon-faithful so they remain a direct reference to TLoD; the engine
 * pumps them up here for our real-time pacing (turn-based encounters
 * are 6-12 actions long, our duels are dozens of swings per minute, so
 * raw canon HP would melt in a second).
 *
 * One central knob = one place to tune as we iterate on game feel.
 * Add `mobDamage`, `playerHp`, `xpReward`, etc. fields as the balance
 * pass grows — same shape, same spawn-time application path.
 */
export const BALANCE_SCALE = {
  /** Multiplier applied to MobDefinition.health when spawning a mob.
   *  v1 first-pass: ×10. Commander 15 → 150, Berserk Mouse 5 → 50,
   *  Fruegel 90 → 900. Canon ratios between mobs are preserved; only
   *  the absolute scale moves. Adjust here, not in the per-mob entries. */
  mobHp: 10,
} as const;

export interface MobDefinition {
  /** TLoD-canon JP HP. The actual entity's Health.max at spawn is
   *  `health * BALANCE_SCALE.mobHp` — see the constant above for the
   *  rationale on the multiplier. */
  health: number;
  speed: number;
  stats: Stats;
  sprite: Omit<Sprite, 'layer' | 'scale'>;
  /** Defensive element. Read by `damage.ts` to compute the Element
   *  modifier against the attack's element (×1.5 / ×0.5 / ×1). Required
   *  — every TLoD combatant has an element; mobs without canon evidence
   *  use 'non-elemental' so the modifier stays neutral until verified. */
  element: Element;
  /** Override for the element of this mob's PHYSICAL attacks. Canon
   *  default: mob physical is Non-Elemental (the wiki lists only enemy
   *  magical attacks as elemental sources). Set this when a specific
   *  mob's physical hit IS canon-elemental — e.g. a fire-spirit whose
   *  basic attack is Fire-tagged. Magic damage uses the spell element
   *  separately and is unaffected by this field. */
  physicalElement?: Element;
  /** XP awarded on kill. */
  xp: number;
  /** True for named bosses. Drives Survival's first-boss-kill counter
   *  used by the Dragoon-unlock upgrade gate (VISION §6.5). */
  boss?: boolean;
}

// TLoD-canon stat blocks (HP / AT / DF / MAT / MDF / SPD / A-AV / M-AV
// + XP / Gold drop) come from the author's full enemy spreadsheet (Bestiary
// row #s noted per mob). The action-RPG-specific fields stay tuned for our
// real-time engine: `speed` is the world px / ms travel rate (not the TLoD
// SPD turn-order stat — that one lives in `stats.speed` for future use),
// `range` is the world-px attack reach, `aggroRange` controls AI engagement
// distance.
export const MOBS: Record<MobKind, MobDefinition> = {
  // Bestiary #25.
  berserkMouse: {
    health: 2,
    speed: 0.12,
    stats: {
      atk: 1,
      def: 80,
      magicAtk: 1,
      magicDef: 45,
      speed: 120,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
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
    element: 'darkness',
    xp: 3,
  },
  // Bestiary #9.
  goblin: {
    health: 4,
    speed: 0.1,
    stats: {
      atk: 2,
      def: 120,
      magicAtk: 1,
      magicDef: 40,
      speed: 120,
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
    element: 'fire',
    xp: 4,
  },
  // Bestiary #22.
  assassinCock: {
    health: 3,
    speed: 0.16,
    stats: {
      atk: 2,
      def: 100,
      magicAtk: 2,
      magicDef: 45,
      speed: 120,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
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
    element: 'wind',
    xp: 5,
  },
  // Bestiary #39.
  trent: {
    health: 5,
    speed: 0.06,
    stats: {
      atk: 2,
      def: 160,
      magicAtk: 2,
      magicDef: 30,
      speed: 40,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
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
    element: 'earth',
    xp: 4,
  },
  // BOSS — Fruegel, Hellena Prison's warden. Numbers are TLoD-canonical
  // (1st visit, US/EU column): high physical defence + middling damage,
  // designed in the original to be brutally tanky for the player's first
  // proper boss. Action-RPG translation: melee swing every ~1.5 s, world
  // speed slow enough that the player can kite. We keep aggroRange tiny
  // here because the WaveSpawnerSystem overrides it to 99 999 on spawn —
  // bosses are pre-engaged so they march on the player from across the
  // arena instead of idling.
  // Knight of Sandora — two narrative variants in TLoD canon, same
  // sprite sheet, different stat blocks:
  //   - Seles: the early-game encounter (Chapter 1 prologue area).
  //   - Kazas Black Castle: Chapter 3, much later, scaled up.
  // STATS BELOW ARE PLACEHOLDER — pending canon values from the user
  // for the damage-check pass. The shape + numbers exist only so the
  // engine type-checks and the Codex renders something; do not balance
  // anything against these until they're replaced.
  // Canon PS1 values supplied by the user 2026-06-11. Hit% / speed /
  // atkSpeed / range / aggroRange are action-RPG-only fields the wiki
  // doesn't expose — kept at sensible humanoid-melee defaults.
  knightOfSandoraSeles: {
    health: 4,
    speed: 0.1,
    stats: {
      atk: 2,
      def: 40,
      magicAtk: 2,
      magicDef: 50,
      speed: 50,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
      atkSpeed: 1,
      range: 80,
      aggroRange: 220,
    },
    sprite: {
      // Humanoid soldier silhouette — shared sprite sheet with the
      // Kazas variant. fitMode: 'height' lets the walk-cycle frames
      // (slightly wider stride than idle) keep the same on-screen
      // height as the idle pose.
      shape: 'capsule',
      color: 0x6b7a8f,
      width: 64,
      height: 96,
      fitMode: 'height',
      textureAlias: 'sprite.mob.knightOfSandora',
      attackTextureAlias: 'sprite.mob.knightOfSandora.attack.1',
      walkFrames: ['sprite.mob.knightOfSandora.walk.1', 'sprite.mob.knightOfSandora.walk.2'],
      attackFrames: ['sprite.mob.knightOfSandora.attack.1', 'sprite.mob.knightOfSandora.attack.2'],
      throwFrames: [
        'sprite.mob.knightOfSandora.throw.1',
        'sprite.mob.knightOfSandora.throw.2',
        'sprite.mob.knightOfSandora.throw.3',
      ],
    },
    element: 'fire',
    xp: 2,
  },
  knightOfSandoraKazas: {
    health: 12,
    speed: 0.1,
    stats: {
      atk: 3,
      def: 100,
      magicAtk: 0,
      magicDef: 80,
      speed: 50,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
      atkSpeed: 1,
      range: 80,
      aggroRange: 220,
    },
    sprite: {
      // Shares the Seles sprite sheet — same Knight visual, beefier
      // stats for the Chapter 3 encounter.
      shape: 'capsule',
      color: 0x6b7a8f,
      width: 64,
      height: 96,
      fitMode: 'height',
      textureAlias: 'sprite.mob.knightOfSandora',
      attackTextureAlias: 'sprite.mob.knightOfSandora.attack.1',
      walkFrames: ['sprite.mob.knightOfSandora.walk.1', 'sprite.mob.knightOfSandora.walk.2'],
      attackFrames: ['sprite.mob.knightOfSandora.attack.1', 'sprite.mob.knightOfSandora.attack.2'],
      throwFrames: [
        'sprite.mob.knightOfSandora.throw.1',
        'sprite.mob.knightOfSandora.throw.2',
        'sprite.mob.knightOfSandora.throw.3',
      ],
    },
    element: 'fire',
    xp: 12,
  },
  // Commander (Seles) — Boss canon Disc 1, paired with 2 Knights of
  // Sandora in Dart's first scripted fight. Stats from the canon doc
  // (docs/features/bosses/Commander.md): HP 15 (JP — Damia adopts the
  // JP +1 delta per fandom canon "Damia adopt JP HP 15"), AT 2, DF 40,
  // MAT 4, MDF 40, SPD 40, Darkness element (breaks the Sandora-Fire
  // pattern of his Knights), XP 20, Gold 20, Burn Out 100% drop. AI
  // Power Up state machine + HP-recovers + scripted-with-Knights
  // interactions not wired yet — V1 ships with the standard humanoid
  // melee chassis until the boss AI lands.
  commanderSeles: {
    health: 15,
    speed: 0.08,
    stats: {
      atk: 2,
      def: 40,
      magicAtk: 4,
      magicDef: 40,
      speed: 40,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
      atkSpeed: 0.8,
      range: 80,
      aggroRange: 240,
    },
    sprite: {
      // Tall officer silhouette — sized so he reads as visibly bigger
      // than Dart in-world (Dart renders at ~45x81 px with the same
      // fitMode pipeline). With `fitMode: 'height'` the width adapts
      // to each texture's aspect ratio automatically, so a single
      // height bump scales the WHOLE kit (idle / walk / attack /
      // slash-twice / cast / power-up / death) uniformly.
      shape: 'capsule',
      color: 0x3a2a3a,
      width: 76,
      height: 125,
      fitMode: 'height',
      textureAlias: 'sprite.mob.commander',
      attackTextureAlias: 'sprite.mob.commander.attack.1',
      castTextureAlias: 'sprite.mob.commander.cast',
      powerUpFrames: ['sprite.mob.commander.powerup.1'],
      deathTextureAlias: 'sprite.mob.commander.death',
      walkFrames: ['sprite.mob.commander.walk.1', 'sprite.mob.commander.walk.2'],
      attackFrames: ['sprite.mob.commander.attack.1', 'sprite.mob.commander.attack.2'],
      // Slash Twice — post-PowerUp basic attack: a 5-frame double-strike
      // choreography (wind-up → strike 1 → recovery → wind-up 2 →
      // strike 2). RenderSystem picks these when the AttackSwing has
      // kind:'slashTwice' (set by CombatSystem while AI.poweredUp), one
      // frame per 1/5 of COMMANDER_SLASH_TWICE_SWING_MS. The 2× damage
      // applies in lockstep.
      slashTwiceFrames: [
        'sprite.mob.commander.slashTwice.1',
        'sprite.mob.commander.slashTwice.2',
        'sprite.mob.commander.slashTwice.3',
        'sprite.mob.commander.slashTwice.4',
        'sprite.mob.commander.slashTwice.5',
      ],
    },
    element: 'darkness',
    xp: 20,
    boss: true,
  },
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
    // No canon evidence for Fruegel's element yet — defaults to
    // non-elemental so the modifier stays a neutral ×1. Verify
    // against the wiki and update when we get to the Hellena pass.
    element: 'non-elemental',
    xp: 240,
    boss: true,
  },
} as const;

// Damage math lives in `gameplay/damage.ts` now — the TLoD canon
// formulas (Player Archer Attack / Enemy Physical / Addition / Item
// Magic) are deterministic and read effective stats through the
// Dragoon-aware helpers, so the old subtractive `computeDamage` stub
// + RNG variance went away. `COMBAT.defendingDamageMul` is consumed
// directly inside damage.ts as the Guard modifier.

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
  /** Per-level damage multiplier in TLoD canon (100-based: 100 = 1.0×,
   *  150 = 1.5×). Plugged into the addition damage formula as
   *  `floor[hitValue × multiplier / 100]`. Source: TLoD damage doc,
   *  "Addition Multiplier Data" tables. */
  multiplier: number;
  /** SP awarded over the full sequence (split per landing hit). */
  spGain: number;
}

export interface AdditionDefinition {
  /** Display name (used by Hotbar tooltip / ActionLog). */
  name: string;
  /** TLoD-canon hit-by-hit base values ("Addition Hit Data" chart).
   *  Length defines the number of hits — `hits.length === nbHits`.
   *  Per-hit damage uses `hits[i]` directly in the addition formula. */
  hits: readonly number[];
  /** Total animation duration in ms. Derived from `hits.length`. */
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

/** Builder for an `AdditionDefinition`. The hits + multipliers tables
 *  are the TLoD-canon "Addition Hit Data" + "Addition Multiplier Data"
 *  charts (source: TLoD damage doc). spGains is our SP design — not
 *  canon TLoD. Animation timings + cooldown are derived from the hit
 *  count so adding a new addition is a single builder call. */
function build(opts: {
  name: string;
  hits: readonly number[];
  multipliers: readonly [number, number, number, number, number];
  spGains: readonly [number, number, number, number, number];
  rangeOverridePx?: number;
}): AdditionDefinition {
  const nbHits = opts.hits.length;
  const hitTimingsMs = Array.from({ length: nbHits }, (_, i) => (i + 1) * HIT_INTERVAL_MS);
  const totalMs = nbHits * HIT_INTERVAL_MS + TAIL_MS;
  const cooldownMs = COOLDOWN_BASE_MS + Math.max(0, nbHits - 2) * COOLDOWN_PER_EXTRA_HIT_MS;
  const levels = opts.multipliers.map((multiplier, i) => ({
    multiplier,
    spGain: opts.spGains[i] ?? 0,
  })) as unknown as AdditionDefinition['levels'];
  return {
    name: opts.name,
    hits: opts.hits,
    totalMs,
    hitTimingsMs,
    cooldownMs,
    levels,
    ...(opts.rangeOverridePx !== undefined ? { rangeOverridePx: opts.rangeOverridePx } : {}),
  };
}

export const ADDITIONS: Record<AdditionKind, AdditionDefinition> = {
  // --- Red-Eye Dragoon (Dart) ---------------------------------------------
  doubleSlash: build({
    name: 'Double Slash',
    hits: [100, 50],
    multipliers: [100, 105, 110, 120, 135],
    spGains: [35, 35, 35, 35, 35],
  }),
  volcano: build({
    name: 'Volcano',
    hits: [50, 50, 50, 50],
    multipliers: [100, 105, 110, 115, 125],
    spGains: [20, 24, 28, 32, 36],
  }),
  burningRush: build({
    name: 'Burning Rush',
    hits: [50, 50, 50],
    multipliers: [100, 100, 100, 100, 100],
    spGains: [30, 45, 60, 75, 102],
  }),
  crushDance: build({
    name: 'Crush Dance',
    hits: [30, 30, 30, 30, 30],
    multipliers: [100, 115, 130, 145, 167],
    spGains: [50, 60, 75, 85, 100],
  }),
  madnessHero: build({
    name: 'Madness Hero',
    hits: [20, 20, 20, 20, 10, 10],
    multipliers: [100, 100, 100, 100, 100],
    spGains: [60, 90, 120, 150, 204],
  }),
  moonStrike: build({
    name: 'Moon Strike',
    hits: [30, 30, 30, 30, 30, 30, 20],
    multipliers: [100, 120, 140, 160, 175],
    spGains: [20, 20, 20, 20, 20],
  }),
  blazingDynamo: build({
    name: 'Blazing Dynamo',
    hits: [40, 30, 30, 30, 30, 30, 30, 30],
    multipliers: [100, 120, 140, 160, 180],
    spGains: [100, 110, 120, 130, 150],
  }),

  // --- Jade Dragoon (Lavitz / Albert) -------------------------------------
  harpoon: build({
    name: 'Harpoon',
    hits: [75, 25],
    multipliers: [100, 110, 120, 130, 150],
    spGains: [35, 38, 42, 45, 50],
  }),
  spinningCane: build({
    name: 'Spinning Cane',
    hits: [50, 25, 25],
    multipliers: [100, 125, 150, 175, 200],
    spGains: [35, 35, 35, 35, 35],
  }),
  rodTyphoon: build({
    name: 'Rod Typhoon',
    hits: [30, 30, 30, 30, 30],
    multipliers: [100, 108, 116, 124, 135],
    spGains: [30, 45, 60, 75, 100],
  }),
  gustOfWindDance: build({
    name: 'Gust of Wind Dance',
    hits: [30, 30, 30, 30, 30, 30, 20],
    multipliers: [100, 120, 140, 160, 175],
    spGains: [35, 35, 35, 35, 35],
  }),
  flowerStorm: build({
    name: 'Flower Storm',
    hits: [30, 30, 30, 40, 40, 40, 40, 50],
    multipliers: [100, 108, 116, 124, 135],
    spGains: [60, 90, 120, 150, 202],
  }),

  // --- Dark Burst Dragoon (Rose) ------------------------------------------
  whipSmack: build({
    name: 'Whip Smack',
    hits: [75, 25],
    multipliers: [100, 125, 150, 175, 200],
    spGains: [35, 35, 35, 35, 35],
  }),
  moreAndMore: build({
    name: 'More & More',
    hits: [50, 50, 50],
    multipliers: [100, 100, 100, 100, 100],
    spGains: [30, 45, 60, 75, 102],
  }),
  hardBlade: build({
    name: 'Hard Blade',
    hits: [20, 20, 20, 20, 10, 10],
    multipliers: [100, 150, 200, 250, 300],
    spGains: [35, 35, 35, 35, 35],
  }),
  demonsDance: build({
    name: "Demon's Dance",
    hits: [30, 30, 30, 30, 20, 20, 20, 20],
    multipliers: [100, 140, 180, 220, 250],
    spGains: [100, 100, 100, 100, 100],
  }),

  // --- Violet Dragoon (Haschel) -------------------------------------------
  doublePunch: build({
    name: 'Double Punch',
    hits: [75, 25],
    multipliers: [100, 110, 120, 130, 150],
    spGains: [35, 38, 42, 45, 50],
  }),
  flurryOfStyx: build({
    name: 'Flurry of Styx',
    hits: [100, 25, 25],
    multipliers: [100, 108, 116, 124, 135],
    spGains: [20, 20, 20, 20, 20],
  }),
  summon4Gods: build({
    name: 'Summon 4 Gods',
    hits: [25, 25, 25, 25],
    multipliers: [100, 100, 100, 100, 100],
    spGains: [50, 61, 75, 86, 100],
  }),
  fiveRingShattering: build({
    name: '5-Ring Shattering',
    hits: [30, 30, 30, 30, 30],
    multipliers: [100, 125, 150, 175, 200],
    spGains: [35, 35, 40, 45, 50],
  }),
  hexHammer: build({
    name: 'Hex Hammer',
    hits: [30, 30, 30, 30, 30, 30, 20],
    multipliers: [100, 125, 150, 175, 200],
    spGains: [15, 15, 15, 15, 15],
  }),
  omniSweep: build({
    name: 'Omni-Sweep',
    hits: [30, 30, 30, 40, 40, 40, 40, 50],
    multipliers: [100, 115, 130, 145, 167],
    spGains: [50, 75, 100, 125, 150],
  }),

  // --- Blue-Sea Dragoon (Meru) --------------------------------------------
  doubleSmack: build({
    name: 'Double Smack',
    hits: [75, 25],
    multipliers: [100, 110, 120, 130, 150],
    spGains: [20, 24, 28, 32, 34],
  }),
  hammerSpin: build({
    name: 'Hammer Spin',
    hits: [50, 50, 25, 25],
    multipliers: [100, 108, 116, 124, 135],
    spGains: [35, 46, 51, 59, 70],
  }),
  coolBoogie: build({
    name: 'Cool Boogie',
    hits: [20, 20, 20, 20, 20],
    multipliers: [100, 100, 100, 100, 100],
    spGains: [60, 90, 120, 150, 200],
  }),
  catsCradle: build({
    name: "Cat's Cradle",
    hits: [30, 20, 20, 20, 20, 20, 20],
    multipliers: [100, 130, 160, 190, 234],
    spGains: [20, 20, 20, 20, 20],
  }),
  perkyStep: build({
    name: 'Perky Step',
    hits: [30, 30, 30, 30, 20, 20, 20, 20],
    multipliers: [100, 150, 200, 250, 300],
    spGains: [100, 100, 100, 100, 100],
  }),

  // --- Golden Dragoon (Kongol) --------------------------------------------
  pursuit: build({
    name: 'Pursuit',
    hits: [75, 25],
    multipliers: [100, 110, 120, 130, 150],
    spGains: [35, 38, 42, 45, 50],
  }),
  inferno: build({
    name: 'Inferno',
    hits: [40, 20, 20, 20],
    multipliers: [100, 125, 150, 175, 200],
    spGains: [20, 20, 20, 20, 20],
  }),
  boneCrush: build({
    name: 'Bone Crush',
    hits: [50, 30, 30, 30, 30, 30],
    multipliers: [100, 110, 120, 130, 150],
    spGains: [100, 100, 100, 100, 100],
  }),
};

/**
 * Map an addition's lifetime use count to its current level (1..5). TLoD
 * canon: every 20 successful triggers raises the level by 1, capped at 5
 * (= 80 + uses). A fresh slug starts at level 1 with no uses.
 */
export type AdditionLevelIndex = 1 | 2 | 3 | 4 | 5;

/** Lifetime uses that take an addition to its max level (Lv 5). Also the
 *  "mastered" threshold that gates an archetype's master addition — read
 *  via `isAdditionMastered` rather than hardcoding the number. */
export const ADDITION_MASTERY_USES = 80;

/** True once an addition has been triggered enough to reach Lv 5. */
export function isAdditionMastered(uses: number): boolean {
  return uses >= ADDITION_MASTERY_USES;
}

export function getAdditionLevel(uses: number): AdditionLevelIndex {
  if (uses < 20) return 1;
  if (uses < 40) return 2;
  if (uses < 60) return 3;
  if (uses < ADDITION_MASTERY_USES) return 4;
  return 5;
}
