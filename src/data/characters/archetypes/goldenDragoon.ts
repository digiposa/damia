/**
 * Golden Dragoon — Earth element. Giant-axe melee with monstrous
 * HP / ATK / DEF and anemic magic. Slowest movement and atkSpeed
 * in the roster. Kongol holds the spirit in canon.
 *
 * XP curve is TLoD-canonical (Kongol column). Stat row stays
 * placeholder.
 */
import type { DragoonArchetype } from '../types';
import { placeholderStatsByLevel } from '../helpers';

/** TLoD-canonical "Kongol" XP column. LV 1-19 back-filled with
 *  Dart's values (Kongol joins at LV 20 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1166, 1600, 2129, 2764, 3515, 4390, 5400, 6553, 7860, 9331,
  10947, 13017, 15069, 17326, 19798, 22494, 25425, 28599, 32028, 35720, 39685, 43934, 48475, 53320,
  58476, 63955, 69766, 75918, 82422, 89287, 96523, 104140, 112148, 120555, 129373, 138611, 148278,
  158385, 168940, 179955, 191438, 203400, 218962, 235146, 251965, 269431, 287556, 306352, 325832,
  346007, 366890, 388494,
];

export const GOLDEN_DRAGOON: DragoonArchetype = {
  id: 'goldenDragoon',
  element: 'earth',
  attackPattern: 'melee',
  actionStats: {
    // Slowest in the roster — Kongol is the wall.
    moveSpeed: 0.13,
    base: {
      speed: 35,
      // Heavy axe windup.
      atkSpeed: 0.7,
      // Long axe reach.
      range: 108,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
    },
  },
  // TODO: replace with the canonical TLoD Kongol stat row.
  statsByLevel: placeholderStatsByLevel({
    baseHp: 40,
    hpPerLevel: 38,
    hpMidGameBonus: 60,
    baseAtk: 3,
    atkPerLevel: 2.6,
    baseDef: 5,
    defPerLevel: 2.4,
    baseMagicAtk: 1,
    magicAtkPerLevel: 1.0,
    baseMagicDef: 2,
    magicDefPerLevel: 1.3,
  }),
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // Kongol's TLoD canonical unlocks (smallest kit of the cast: 2
  // basics + 1 master). Bone Crush is the Master Addition.
  additionUnlocksByLevel: new Map([
    [1, 'pursuit'],
    [23, 'inferno'],
  ]),
  masterAddition: 'boneCrush',
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.5, def: 1.5, magicAtk: 1.1, magicDef: 1.2, moveSpeed: 1.05 },
    additionUnlocksByLevel: new Map([
      [1, 'goldenDragoonSmash'],
      [10, 'meteorStrike'],
      [30, 'grandStream'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
