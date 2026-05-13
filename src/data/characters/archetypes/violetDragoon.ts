/**
 * Violet Dragoon — Thunder element. Martial-arts melee, fastest
 * atkSpeed in the roster, low magic. Haschel holds the spirit
 * in canon — passed from his daughter Claire (Dart's late mother
 * figure) lore-wise.
 *
 * XP curve is TLoD-canonical (Haschel column). Stat row stays
 * placeholder pending the source `stats.txt` row.
 */
import type { DragoonArchetype } from '../types';
import { placeholderStatsByLevel } from '../helpers';

/** TLoD-canonical "Haschel" XP column. LV 1-13 back-filled with
 *  Dart's values (Haschel joins at LV 14 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1166, 1600, 2129, 2764, 3515, 4434, 5454, 6619, 7939, 9424,
  11084, 12928, 14965, 17207, 19661, 22339, 25250, 28402, 31807, 35474, 39412, 43632, 48142, 52953,
  58074, 63515, 69286, 75396, 81855, 88673, 95859, 103424, 111376, 119726, 128483, 137657, 147258,
  157294, 167777, 178716, 190120, 202000, 217455, 233528, 250231, 267577, 285577, 304244, 323589,
  343626, 364365, 385820,
];

export const VIOLET_DRAGOON: DragoonArchetype = {
  id: 'violetDragoon',
  element: 'thunder',
  attackPattern: 'melee',
  actionStats: {
    moveSpeed: 0.22,
    base: {
      speed: 60,
      // Fastest melee — martial arts means no weapon windup.
      atkSpeed: 2.2,
      // Short reach (close-quarters combat).
      range: 72,
      aggroRange: 0,
      attackHit: 105,
      magicHit: 100,
      attackAvoid: 8,
      magicAvoid: 0,
    },
  },
  // TODO: replace with the canonical TLoD Haschel stat row.
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
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // Haschel's TLoD canonical unlocks. Omni-Sweep is the Master
  // Addition (declared on `masterAddition`). Six basic additions —
  // the second-largest kit after Dart.
  additionUnlocksByLevel: new Map([
    [1, 'doublePunch'],
    [14, 'flurryOfStyx'],
    [18, 'summon4Gods'],
    [22, 'fiveRingShattering'],
    [26, 'hexHammer'],
  ]),
  masterAddition: 'omniSweep',
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.4, def: 1.2, magicAtk: 1.3, magicDef: 1.2, moveSpeed: 1.2 },
    additionUnlocksByLevel: new Map([
      [1, 'thunderGod'],
      [10, 'thunderKid'],
      [30, 'atomicMind'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
