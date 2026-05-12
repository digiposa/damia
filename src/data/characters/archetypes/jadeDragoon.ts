/**
 * Jade Dragoon — Wind element. Lance melee with steady knightly
 * stats. Lavitz holds the spirit first; Albert inherits after
 * Lavitz's narrative death. Survival skins: Graham, Syuveh.
 *
 * Stats + XP + addition unlock schedule are TLoD-canonical (source:
 * the Lavitz/Albert column of the master tables).
 */
import type { CharacterLevelRow, DragoonArchetype } from '../types';

/** TLoD-canonical per-level row (Lavitz / Albert column). */
const STATS_BY_LEVEL: ReadonlyArray<CharacterLevelRow> = [
  { level: 1, hp: 35, atk: 3, def: 4, magicAtk: 2, magicDef: 2 },
  { level: 2, hp: 67, atk: 6, def: 7, magicAtk: 3, magicDef: 3 },
  { level: 3, hp: 100, atk: 13, def: 10, magicAtk: 4, magicDef: 4 },
  { level: 4, hp: 133, atk: 15, def: 13, magicAtk: 6, magicDef: 5 },
  { level: 5, hp: 166, atk: 16, def: 16, magicAtk: 7, magicDef: 6 },
  { level: 6, hp: 199, atk: 20, def: 19, magicAtk: 8, magicDef: 7 },
  { level: 7, hp: 231, atk: 23, def: 22, magicAtk: 10, magicDef: 7 },
  { level: 8, hp: 264, atk: 27, def: 25, magicAtk: 11, magicDef: 8 },
  { level: 9, hp: 297, atk: 30, def: 28, magicAtk: 13, magicDef: 9 },
  { level: 10, hp: 330, atk: 34, def: 31, magicAtk: 14, magicDef: 10 },
  { level: 11, hp: 363, atk: 37, def: 34, magicAtk: 15, magicDef: 11 },
  { level: 12, hp: 454, atk: 41, def: 37, magicAtk: 17, magicDef: 12 },
  { level: 13, hp: 545, atk: 45, def: 41, magicAtk: 18, magicDef: 13 },
  { level: 14, hp: 636, atk: 48, def: 44, magicAtk: 20, magicDef: 14 },
  { level: 15, hp: 728, atk: 52, def: 47, magicAtk: 22, magicDef: 15 },
  { level: 16, hp: 819, atk: 56, def: 51, magicAtk: 23, magicDef: 16 },
  { level: 17, hp: 910, atk: 60, def: 54, magicAtk: 25, magicDef: 17 },
  { level: 18, hp: 1002, atk: 63, def: 57, magicAtk: 27, magicDef: 18 },
  { level: 19, hp: 1093, atk: 67, def: 61, magicAtk: 28, magicDef: 19 },
  { level: 20, hp: 1184, atk: 71, def: 64, magicAtk: 30, magicDef: 20 },
  { level: 21, hp: 1276, atk: 75, def: 67, magicAtk: 31, magicDef: 21 },
  { level: 22, hp: 1399, atk: 78, def: 71, magicAtk: 33, magicDef: 24 },
  { level: 23, hp: 1522, atk: 82, def: 74, magicAtk: 35, magicDef: 27 },
  { level: 24, hp: 1645, atk: 86, def: 77, magicAtk: 37, magicDef: 29 },
  { level: 25, hp: 1768, atk: 90, def: 81, magicAtk: 39, magicDef: 32 },
  { level: 26, hp: 1892, atk: 93, def: 84, magicAtk: 41, magicDef: 35 },
  { level: 27, hp: 2015, atk: 97, def: 87, magicAtk: 43, magicDef: 37 },
  { level: 28, hp: 2138, atk: 101, def: 91, magicAtk: 45, magicDef: 40 },
  { level: 29, hp: 2261, atk: 105, def: 94, magicAtk: 47, magicDef: 43 },
  { level: 30, hp: 2384, atk: 108, def: 97, magicAtk: 48, magicDef: 45 },
  { level: 31, hp: 2508, atk: 112, def: 101, magicAtk: 50, magicDef: 48 },
  { level: 32, hp: 2638, atk: 116, def: 104, magicAtk: 52, magicDef: 49 },
  { level: 33, hp: 2769, atk: 120, def: 107, magicAtk: 54, magicDef: 50 },
  { level: 34, hp: 2900, atk: 123, def: 111, magicAtk: 55, magicDef: 51 },
  { level: 35, hp: 3031, atk: 127, def: 114, magicAtk: 57, magicDef: 52 },
  { level: 36, hp: 3162, atk: 131, def: 117, magicAtk: 59, magicDef: 53 },
  { level: 37, hp: 3293, atk: 135, def: 121, magicAtk: 61, magicDef: 54 },
  { level: 38, hp: 3424, atk: 138, def: 124, magicAtk: 62, magicDef: 55 },
  { level: 39, hp: 3555, atk: 142, def: 127, magicAtk: 64, magicDef: 57 },
  { level: 40, hp: 3686, atk: 146, def: 131, magicAtk: 66, magicDef: 58 },
  { level: 41, hp: 3817, atk: 150, def: 134, magicAtk: 68, magicDef: 59 },
  { level: 42, hp: 4101, atk: 153, def: 137, magicAtk: 70, magicDef: 61 },
  { level: 43, hp: 4386, atk: 157, def: 141, magicAtk: 72, magicDef: 64 },
  { level: 44, hp: 4671, atk: 161, def: 144, magicAtk: 74, magicDef: 67 },
  { level: 45, hp: 4956, atk: 165, def: 147, magicAtk: 76, magicDef: 70 },
  { level: 46, hp: 5241, atk: 168, def: 151, magicAtk: 78, magicDef: 73 },
  { level: 47, hp: 5526, atk: 172, def: 154, magicAtk: 80, magicDef: 76 },
  { level: 48, hp: 5811, atk: 176, def: 157, magicAtk: 82, magicDef: 79 },
  { level: 49, hp: 6096, atk: 180, def: 161, magicAtk: 84, magicDef: 82 },
  { level: 50, hp: 6381, atk: 183, def: 164, magicAtk: 86, magicDef: 85 },
  { level: 51, hp: 6666, atk: 187, def: 167, magicAtk: 88, magicDef: 87 },
  { level: 52, hp: 6842, atk: 191, def: 171, magicAtk: 90, magicDef: 88 },
  { level: 53, hp: 7018, atk: 195, def: 174, magicAtk: 92, magicDef: 89 },
  { level: 54, hp: 7194, atk: 200, def: 178, magicAtk: 94, magicDef: 90 },
  { level: 55, hp: 7370, atk: 204, def: 182, magicAtk: 97, magicDef: 91 },
  { level: 56, hp: 7546, atk: 208, def: 185, magicAtk: 99, magicDef: 93 },
  { level: 57, hp: 7722, atk: 212, def: 189, magicAtk: 101, magicDef: 94 },
  { level: 58, hp: 7898, atk: 216, def: 192, magicAtk: 104, magicDef: 95 },
  { level: 59, hp: 8074, atk: 220, def: 196, magicAtk: 106, magicDef: 96 },
  { level: 60, hp: 8250, atk: 225, def: 199, magicAtk: 108, magicDef: 97 },
];

/** TLoD-canonical "Lavitz / Albert" XP column. LV 1-3 back-filled
 *  with Dart's values (Lavitz joins at LV 4 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 110, 203, 350, 557, 831, 1183, 1624, 2161, 2806, 3567, 4456, 5481, 6651, 7978, 9471,
  11139, 12992, 15039, 17292, 19759, 22450, 25375, 28543, 31965, 35650, 39607, 43848, 48380, 53215,
  58361, 63829, 69629, 75769, 82260, 89112, 96334, 103936, 111927, 120318, 129119, 138338, 147987,
  158073, 168608, 179601, 191061, 203000, 218531, 234684, 251470, 268901, 286991, 305750, 325191,
  345327, 366169, 387730,
];

export const JADE_DRAGOON: DragoonArchetype = {
  id: 'jadeDragoon',
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
  statsByLevel: STATS_BY_LEVEL,
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // Canonical TLoD unlock schedule for Lavitz/Albert. Flower Storm
  // is the Master Addition (declared on `masterAddition`), not here.
  additionUnlocksByLevel: new Map([
    [1, 'harpoon'],
    [5, 'spinningCane'],
    [7, 'rodTyphoon'],
    [11, 'gustOfWindDance'],
  ]),
  masterAddition: 'flowerStorm',
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.3, def: 1.4, magicAtk: 1.4, magicDef: 1.3, hp: 1.0, moveSpeed: 1.1 },
    // Jade Dragoon spells in TLoD: Wing Blaster, Rose Storm, Gates
    // of Heaven. Slugs not in ADDITIONS yet.
    additionUnlocksByLevel: new Map([
      [1, 'wingBlaster'],
      [10, 'roseStorm'],
      [30, 'gatesOfHeaven'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
