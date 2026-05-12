/**
 * Haschel — Violet Dragoon (Thunder), elder martial artist. No
 * weapon, fast martial-arts strikes, high physical / low magic.
 * Joins at LV14 in TLoD.
 *
 * Sprite placeholders point at Dart until the dedicated PNG lands.
 * Stat table is procedural placeholder.
 */
import type { CharacterDef } from './types';
import { placeholderStatsByLevel } from './types';

/**
 * Cumulative XP to reach each level — TLoD canonical "Haschel"
 * column. Levels 1-13 back-filled with Dart's values (Haschel
 * joins at LV14 in the original).
 */
const HASCHEL_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1166, 1600, 2129, 2764, 3515, 4434, 5454, 6619, 7939, 9424,
  11084, 12928, 14965, 17207, 19661, 22339, 25250, 28402, 31807, 35474, 39412, 43632, 48142, 52953,
  58074, 63515, 69286, 75396, 81855, 88673, 95859, 103424, 111376, 119726, 128483, 137657, 147258,
  157294, 167777, 178716, 190120, 202000, 217455, 233528, 250231, 267577, 285577, 304244, 323589,
  343626, 364365, 385820,
];

export const HASCHEL: CharacterDef = {
  id: 'haschel',
  displayNameKey: 'character.haschel.name',
  element: 'thunder',
  attackPattern: 'melee',
  actionStats: {
    // Fastest melee in the roster — martial arts means no weapon
    // windup, just punches.
    moveSpeed: 0.22,
    base: {
      speed: 60,
      atkSpeed: 2.2,
      // Short reach — martial arts is close-quarters.
      range: 72,
      aggroRange: 0,
      attackHit: 105,
      magicHit: 100,
      attackAvoid: 8,
      magicAvoid: 0,
    },
  },
  // TODO: replace with the canonical TLoD Haschel stat row when on
  // hand. Profile: high physical, low magic, decent HP.
  statsByLevel: placeholderStatsByLevel({
    baseHp: 26,
    hpPerLevel: 24,
    hpMidGameBonus: 38,
    baseAtk: 2,
    atkPerLevel: 2.2,
    baseDef: 3,
    defPerLevel: 1.7,
    baseMagicAtk: 1,
    magicAtkPerLevel: 1.3,
    baseMagicDef: 3,
    magicDefPerLevel: 1.7,
  }),
  xpToReachLevel: HASCHEL_XP_TO_REACH_LEVEL,
  // Haschel's TLoD Additions: Double Punch, Flurry of Styx, Summon
  // Four Gods, Five-Ring Shattering.
  additionUnlocksByLevel: new Map([
    [1, 'doublePunch'],
    [8, 'flurryOfStyx'],
    [15, 'summonFourGods'],
    [22, 'fiveRingShattering'],
  ]),
  sprite: {
    idle: 'sprite.player.haschel',
    attack: 'sprite.player.haschel.attack',
    defend: 'sprite.player.haschel.defend',
    additions: {},
  },
};
