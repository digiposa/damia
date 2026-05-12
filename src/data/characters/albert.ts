/**
 * Albert — King of Serdio, Jade Dragoon (Wind). Inherits Lavitz's
 * Dragoon Spirit after Lavitz's death in TLoD. Lance melee + wind
 * magic; closer to a hybrid than Lavitz's pure physical lean.
 *
 * Shares Lavitz's canonical XP curve in the TLoD tables (same
 * column). Stat table is procedural placeholder until the canonical
 * row from shareAI/assetsTLOD/characters/Albert/stats.txt lands.
 */
import type { CharacterDef } from './types';
import { LAVITZ_STATS_BY_LEVEL } from './lavitz';

/** Cumulative XP to reach each level — same column as Lavitz. */
const ALBERT_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 110, 203, 350, 557, 831, 1183, 1624, 2161, 2806, 3567, 4456, 5481, 6651, 7978, 9471,
  11139, 12992, 15039, 17292, 19759, 22450, 25375, 28543, 31965, 35650, 39607, 43848, 48380, 53215,
  58361, 63829, 69629, 75769, 82260, 89112, 96334, 103936, 111927, 120318, 129119, 138338, 147987,
  158073, 168608, 179601, 191061, 203000, 218531, 234684, 251470, 268901, 286991, 305750, 325191,
  345327, 366169, 387730,
];

export const ALBERT: CharacterDef = {
  id: 'albert',
  displayNameKey: 'character.albert.name',
  element: 'wind',
  attackPattern: 'melee',
  actionStats: {
    moveSpeed: 0.18,
    base: {
      speed: 52,
      atkSpeed: 1.3,
      range: 100,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
    },
  },
  // Albert shares Lavitz's canonical stat row in TLoD's tables
  // (both Jade Dragoon, Albert inherits the Spirit) — reuse the
  // same const so they stay perfectly in sync.
  statsByLevel: LAVITZ_STATS_BY_LEVEL,
  xpToReachLevel: ALBERT_XP_TO_REACH_LEVEL,
  // Same Additions as Lavitz — inherits the Jade Dragoon Spirit.
  // Harpoon → Spinning Cane → Rod Typhoon → Gust of Wind Dance →
  // Flower Storm. None declared in ADDITIONS yet.
  additionUnlocksByLevel: new Map([
    [1, 'harpoon'],
    [9, 'spinningCane'],
    [18, 'rodTyphoon'],
    [32, 'gustOfWindDance'],
    [50, 'flowerStorm'],
  ]),
  sprite: {
    idle: 'sprite.player.albert',
    attack: 'sprite.player.albert.attack',
    defend: 'sprite.player.albert.defend',
    additions: {},
  },
};
