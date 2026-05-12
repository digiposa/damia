/**
 * Blue-Sea Dragoon — Water element. Hammer melee with high
 * agility, decent magic. Meru holds the spirit in canon; Damia
 * was its previous bearer during the Dragon Campaign.
 *
 * Stats + XP canonical (Meru column).
 */
import type { CharacterLevelRow, DragoonArchetype } from '../types';

const STATS_BY_LEVEL: ReadonlyArray<CharacterLevelRow> = [
  { level: 1, hp: 18, atk: 2, def: 2, magicAtk: 3, magicDef: 4 },
  { level: 2, hp: 36, atk: 3, def: 3, magicAtk: 6, magicDef: 7 },
  { level: 3, hp: 54, atk: 5, def: 4, magicAtk: 9, magicDef: 10 },
  { level: 4, hp: 72, atk: 7, def: 6, magicAtk: 12, magicDef: 13 },
  { level: 5, hp: 90, atk: 8, def: 7, magicAtk: 15, magicDef: 16 },
  { level: 6, hp: 108, atk: 10, def: 9, magicAtk: 19, magicDef: 20 },
  { level: 7, hp: 126, atk: 12, def: 10, magicAtk: 22, magicDef: 23 },
  { level: 8, hp: 144, atk: 13, def: 11, magicAtk: 25, magicDef: 26 },
  { level: 9, hp: 162, atk: 15, def: 13, magicAtk: 28, magicDef: 29 },
  { level: 10, hp: 180, atk: 17, def: 14, magicAtk: 31, magicDef: 32 },
  { level: 11, hp: 198, atk: 19, def: 16, magicAtk: 34, magicDef: 36 },
  { level: 12, hp: 247, atk: 21, def: 17, magicAtk: 38, magicDef: 39 },
  { level: 13, hp: 297, atk: 23, def: 19, magicAtk: 42, magicDef: 42 },
  { level: 14, hp: 347, atk: 25, def: 21, magicAtk: 46, magicDef: 45 },
  { level: 15, hp: 397, atk: 27, def: 23, magicAtk: 50, magicDef: 48 },
  { level: 16, hp: 447, atk: 29, def: 25, magicAtk: 54, magicDef: 51 },
  { level: 17, hp: 496, atk: 31, def: 27, magicAtk: 58, magicDef: 54 },
  { level: 18, hp: 546, atk: 33, def: 29, magicAtk: 62, magicDef: 57 },
  { level: 19, hp: 596, atk: 35, def: 31, magicAtk: 66, magicDef: 60 },
  { level: 20, hp: 646, atk: 37, def: 33, magicAtk: 70, magicDef: 63 },
  { level: 21, hp: 696, atk: 40, def: 34, magicAtk: 74, magicDef: 66 },
  { level: 22, hp: 763, atk: 41, def: 37, magicAtk: 77, magicDef: 69 },
  { level: 23, hp: 830, atk: 42, def: 39, magicAtk: 81, magicDef: 73 },
  { level: 24, hp: 897, atk: 43, def: 41, magicAtk: 85, magicDef: 76 },
  { level: 25, hp: 964, atk: 44, def: 43, magicAtk: 88, magicDef: 80 },
  { level: 26, hp: 1032, atk: 45, def: 45, magicAtk: 92, magicDef: 84 },
  { level: 27, hp: 1099, atk: 46, def: 47, magicAtk: 96, magicDef: 87 },
  { level: 28, hp: 1166, atk: 47, def: 49, magicAtk: 99, magicDef: 91 },
  { level: 29, hp: 1233, atk: 48, def: 52, magicAtk: 103, magicDef: 94 },
  { level: 30, hp: 1300, atk: 49, def: 54, magicAtk: 107, magicDef: 98 },
  { level: 31, hp: 1368, atk: 50, def: 56, magicAtk: 111, magicDef: 102 },
  { level: 32, hp: 1439, atk: 52, def: 58, magicAtk: 114, magicDef: 105 },
  { level: 33, hp: 1510, atk: 53, def: 60, magicAtk: 118, magicDef: 108 },
  { level: 34, hp: 1582, atk: 54, def: 62, magicAtk: 122, magicDef: 111 },
  { level: 35, hp: 1653, atk: 56, def: 65, magicAtk: 126, magicDef: 114 },
  { level: 36, hp: 1725, atk: 57, def: 67, magicAtk: 130, magicDef: 117 },
  { level: 37, hp: 1796, atk: 58, def: 69, magicAtk: 133, magicDef: 120 },
  { level: 38, hp: 1867, atk: 60, def: 71, magicAtk: 137, magicDef: 123 },
  { level: 39, hp: 1939, atk: 61, def: 73, magicAtk: 141, magicDef: 126 },
  { level: 40, hp: 2010, atk: 62, def: 75, magicAtk: 145, magicDef: 129 },
  { level: 41, hp: 2082, atk: 64, def: 77, magicAtk: 149, magicDef: 133 },
  { level: 42, hp: 2237, atk: 68, def: 80, magicAtk: 152, magicDef: 136 },
  { level: 43, hp: 2392, atk: 72, def: 82, magicAtk: 156, magicDef: 140 },
  { level: 44, hp: 2548, atk: 76, def: 85, magicAtk: 160, magicDef: 143 },
  { level: 45, hp: 2703, atk: 80, def: 87, magicAtk: 163, magicDef: 147 },
  { level: 46, hp: 2859, atk: 85, def: 90, magicAtk: 167, magicDef: 150 },
  { level: 47, hp: 3014, atk: 89, def: 92, magicAtk: 171, magicDef: 154 },
  { level: 48, hp: 3169, atk: 93, def: 94, magicAtk: 174, magicDef: 157 },
  { level: 49, hp: 3325, atk: 97, def: 97, magicAtk: 178, magicDef: 161 },
  { level: 50, hp: 3480, atk: 101, def: 99, magicAtk: 182, magicDef: 164 },
  { level: 51, hp: 3636, atk: 105, def: 102, magicAtk: 186, magicDef: 168 },
  { level: 52, hp: 3732, atk: 110, def: 104, magicAtk: 190, magicDef: 171 },
  { level: 53, hp: 3828, atk: 115, def: 106, magicAtk: 194, magicDef: 174 },
  { level: 54, hp: 3924, atk: 119, def: 108, magicAtk: 199, magicDef: 178 },
  { level: 55, hp: 4020, atk: 124, def: 110, magicAtk: 203, magicDef: 181 },
  { level: 56, hp: 4116, atk: 129, def: 112, magicAtk: 207, magicDef: 184 },
  { level: 57, hp: 4212, atk: 133, def: 114, magicAtk: 212, magicDef: 188 },
  { level: 58, hp: 4308, atk: 138, def: 116, magicAtk: 216, magicDef: 191 },
  { level: 59, hp: 4404, atk: 143, def: 118, magicAtk: 220, magicDef: 195 },
  { level: 60, hp: 4500, atk: 147, def: 120, magicAtk: 225, magicDef: 198 },
];

/** TLoD-canonical "Meru" XP column. LV 1-17 back-filled with
 *  Dart's values (Meru joins at LV 18 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1166, 1600, 2129, 2764, 3515, 4390, 5400, 6553, 7860, 9443,
  11106, 12953, 14995, 17241, 19700, 22383, 25300, 28459, 31870, 35544, 39490, 43718, 48237, 53057,
  58189, 63641, 69423, 75545, 82017, 88848, 96049, 103628, 111596, 119963, 128737, 137929, 147549,
  157606, 168110, 179070, 190497, 202400, 217885, 233490, 250727, 268107, 286143, 304846, 324230,
  344306, 365087, 386584,
];

export const BLUE_SEA_DRAGOON: DragoonArchetype = {
  id: 'blueSeaDragoon',
  element: 'water',
  attackPattern: 'melee',
  actionStats: {
    // Visibly faster than Dart's 0.18 — Meru-the-dancer flavour.
    moveSpeed: 0.21,
    base: {
      speed: 55,
      // Hammer pole reach + her energetic combo cadence.
      atkSpeed: 1.8,
      range: 96,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 0,
    },
  },
  statsByLevel: STATS_BY_LEVEL,
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // Meru's TLoD canonical unlocks. Perky Step is the Master Addition
  // (declared on `masterAddition`).
  additionUnlocksByLevel: new Map([
    [1, 'doubleSmack'],
    [21, 'hammerSpin'],
    [26, 'coolBoogie'],
    [30, 'catsCradle'],
  ]),
  masterAddition: 'perkyStep',
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.3, def: 1.2, magicAtk: 1.5, magicDef: 1.4, hp: 1.0, moveSpeed: 1.15 },
    // Blue-Sea Dragoon spells: Rainbow Breath, Freezing Ring,
    // Diamond Dust (dragoon version), Box of Light.
    additionUnlocksByLevel: new Map([
      [1, 'rainbowBreath'],
      [10, 'freezingRing'],
      [30, 'boxOfLight'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
