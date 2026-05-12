/**
 * Lavitz Slambert — Jade Dragoon (Wind), Basil knight, Dart's
 * brother-in-arms. Lance melee, balanced stats with a slight
 * physical / defence lean. Joins early in TLoD (LV4).
 *
 * Sprite aliases resolve to Dart's PNGs until the dedicated PNG
 * lands at /assets/sprites/player/lavitz*.png — swap URLs in
 * AssetManager when on hand. Stat table is procedural placeholder
 * until the canonical row from shareAI/assetsTLOD/characters/Lavitz/
 * stats.txt is plugged in (replace the `placeholderStatsByLevel(…)`
 * call below with a literal array).
 */
import type { CharacterDef } from './types';
import { placeholderStatsByLevel } from './types';

/**
 * Cumulative XP to reach each level — TLoD canonical "Lavitz /
 * Albert" column (they share the same archetype + curve).
 * Levels 1-3 back-filled with Dart's values (Lavitz joins at LV4
 * in the original; Survival starts at LV1 universally).
 */
const LAVITZ_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 110, 203, 350, 557, 831, 1183, 1624, 2161, 2806, 3567, 4456, 5481, 6651, 7978, 9471,
  11139, 12992, 15039, 17292, 19759, 22450, 25375, 28543, 31965, 35650, 39607, 43848, 48380, 53215,
  58361, 63829, 69629, 75769, 82260, 89112, 96334, 103936, 111927, 120318, 129119, 138338, 147987,
  158073, 168608, 179601, 191061, 203000, 218531, 234684, 251470, 268901, 286991, 305750, 325191,
  345327, 366169, 387730,
];

export const LAVITZ: CharacterDef = {
  id: 'lavitz',
  displayNameKey: 'character.lavitz.name',
  element: 'wind',
  attackPattern: 'melee',
  actionStats: {
    moveSpeed: 0.18,
    base: {
      speed: 52,
      atkSpeed: 1.4,
      // Lance reach — slightly longer than a sword.
      range: 100,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
    },
  },
  // TODO: replace with the canonical TLoD Lavitz stat row when on
  // hand. Profile leans physical / defensive (knight archetype).
  statsByLevel: placeholderStatsByLevel({
    baseHp: 28,
    hpPerLevel: 26,
    hpMidGameBonus: 38,
    baseAtk: 2,
    atkPerLevel: 2.1,
    baseDef: 4,
    defPerLevel: 2.0,
    baseMagicAtk: 2,
    magicAtkPerLevel: 1.8,
    baseMagicDef: 3,
    magicDefPerLevel: 1.9,
  }),
  xpToReachLevel: LAVITZ_XP_TO_REACH_LEVEL,
  // Lavitz's TLoD Additions: Spinning Cane, Rod Typhoon, Falcon
  // Dive, Gust of Wind Dance. None declared in ADDITIONS yet.
  additionUnlocksByLevel: new Map([
    [1, 'spinningCane'],
    [8, 'rodTyphoon'],
    [15, 'falconDive'],
    [22, 'gustOfWindDance'],
  ]),
  sprite: {
    idle: 'sprite.player.lavitz',
    attack: 'sprite.player.lavitz.attack',
    defend: 'sprite.player.lavitz.defend',
    additions: {},
  },
};
