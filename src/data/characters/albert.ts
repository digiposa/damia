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
import { placeholderStatsByLevel } from './types';

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
  // TODO: replace with the canonical TLoD Albert stat row. Profile
  // softer than Lavitz on physical, stronger on magic (king who
  // studied — narrative archetype).
  statsByLevel: placeholderStatsByLevel({
    baseHp: 27,
    hpPerLevel: 24,
    hpMidGameBonus: 38,
    baseAtk: 2,
    atkPerLevel: 1.9,
    baseDef: 4,
    defPerLevel: 1.9,
    baseMagicAtk: 3,
    magicAtkPerLevel: 2.3,
    baseMagicDef: 4,
    magicDefPerLevel: 2.1,
  }),
  xpToReachLevel: ALBERT_XP_TO_REACH_LEVEL,
  // Same Additions as Lavitz (he inherits the Jade Dragoon Spirit).
  additionUnlocksByLevel: new Map([
    [1, 'spinningCane'],
    [8, 'rodTyphoon'],
    [15, 'falconDive'],
    [22, 'gustOfWindDance'],
  ]),
  sprite: {
    idle: 'sprite.player.albert',
    attack: 'sprite.player.albert.attack',
    defend: 'sprite.player.albert.defend',
    additions: {},
  },
};
