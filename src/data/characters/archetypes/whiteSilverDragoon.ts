/**
 * White-Silver Dragoon — Light element. Ranged bow with magic
 * lean. Shana holds the spirit first; Miranda inherits in TLoD's
 * Disc 3. Survival skin: Shirley (the ancestor Dragoon from the
 * Dragon Campaign 11 000 years prior).
 *
 * Stats + XP canonical (source: Shana/Miranda column). No
 * Additions in TLoD canon — White-Silver users rely on items
 * + Dragoon spells.
 */
import type { CharacterLevelRow, DragoonArchetype } from '../types';

/** TLoD-canonical per-level row (Shana / Miranda column). */
const STATS_BY_LEVEL: ReadonlyArray<CharacterLevelRow> = [
  { level: 1, hp: 24, atk: 2, def: 2, magicAtk: 3, magicDef: 3 },
  { level: 2, hp: 48, atk: 3, def: 3, magicAtk: 6, magicDef: 6 },
  { level: 3, hp: 72, atk: 5, def: 5, magicAtk: 9, magicDef: 9 },
  { level: 4, hp: 96, atk: 7, def: 6, magicAtk: 12, magicDef: 12 },
  { level: 5, hp: 120, atk: 8, def: 8, magicAtk: 16, magicDef: 15 },
  { level: 6, hp: 144, atk: 10, def: 9, magicAtk: 19, magicDef: 19 },
  { level: 7, hp: 168, atk: 12, def: 11, magicAtk: 22, magicDef: 22 },
  { level: 8, hp: 192, atk: 13, def: 12, magicAtk: 26, magicDef: 25 },
  { level: 9, hp: 216, atk: 15, def: 14, magicAtk: 29, magicDef: 28 },
  { level: 10, hp: 240, atk: 17, def: 15, magicAtk: 32, magicDef: 31 },
  { level: 11, hp: 264, atk: 19, def: 17, magicAtk: 36, magicDef: 35 },
  { level: 12, hp: 330, atk: 20, def: 18, magicAtk: 41, magicDef: 41 },
  { level: 13, hp: 396, atk: 21, def: 20, magicAtk: 47, magicDef: 47 },
  { level: 14, hp: 463, atk: 22, def: 22, magicAtk: 53, magicDef: 53 },
  { level: 15, hp: 529, atk: 23, def: 24, magicAtk: 58, magicDef: 59 },
  { level: 16, hp: 596, atk: 24, def: 25, magicAtk: 64, magicDef: 65 },
  { level: 17, hp: 662, atk: 26, def: 27, magicAtk: 70, magicDef: 71 },
  { level: 18, hp: 728, atk: 27, def: 29, magicAtk: 75, magicDef: 77 },
  { level: 19, hp: 795, atk: 28, def: 31, magicAtk: 81, magicDef: 83 },
  { level: 20, hp: 861, atk: 29, def: 33, magicAtk: 87, magicDef: 89 },
  { level: 21, hp: 928, atk: 30, def: 34, magicAtk: 93, magicDef: 95 },
  { level: 22, hp: 1017, atk: 32, def: 36, magicAtk: 98, magicDef: 101 },
  { level: 23, hp: 1107, atk: 33, def: 37, magicAtk: 104, magicDef: 106 },
  { level: 24, hp: 1196, atk: 35, def: 39, magicAtk: 109, magicDef: 111 },
  { level: 25, hp: 1286, atk: 36, def: 40, magicAtk: 115, magicDef: 117 },
  { level: 26, hp: 1376, atk: 38, def: 42, magicAtk: 120, magicDef: 122 },
  { level: 27, hp: 1465, atk: 39, def: 43, magicAtk: 126, magicDef: 128 },
  { level: 28, hp: 1555, atk: 40, def: 45, magicAtk: 131, magicDef: 133 },
  { level: 29, hp: 1644, atk: 42, def: 46, magicAtk: 137, magicDef: 139 },
  { level: 30, hp: 1734, atk: 43, def: 48, magicAtk: 143, magicDef: 144 },
  { level: 31, hp: 1824, atk: 45, def: 50, magicAtk: 148, magicDef: 150 },
  { level: 32, hp: 1919, atk: 47, def: 51, magicAtk: 153, magicDef: 155 },
  { level: 33, hp: 2014, atk: 48, def: 53, magicAtk: 158, magicDef: 160 },
  { level: 34, hp: 2109, atk: 50, def: 54, magicAtk: 164, magicDef: 165 },
  { level: 35, hp: 2204, atk: 52, def: 56, magicAtk: 169, magicDef: 170 },
  { level: 36, hp: 2300, atk: 54, def: 57, magicAtk: 174, magicDef: 176 },
  { level: 37, hp: 2395, atk: 56, def: 59, magicAtk: 179, magicDef: 181 },
  { level: 38, hp: 2490, atk: 58, def: 60, magicAtk: 184, magicDef: 186 },
  { level: 39, hp: 2585, atk: 60, def: 62, magicAtk: 189, magicDef: 191 },
  { level: 40, hp: 2680, atk: 61, def: 63, magicAtk: 194, magicDef: 196 },
  { level: 41, hp: 2776, atk: 63, def: 65, magicAtk: 200, magicDef: 202 },
  { level: 42, hp: 2983, atk: 65, def: 68, magicAtk: 202, magicDef: 204 },
  { level: 43, hp: 3190, atk: 67, def: 72, magicAtk: 205, magicDef: 207 },
  { level: 44, hp: 3397, atk: 69, def: 75, magicAtk: 208, magicDef: 209 },
  { level: 45, hp: 3604, atk: 71, def: 79, magicAtk: 211, magicDef: 212 },
  { level: 46, hp: 3812, atk: 73, def: 83, magicAtk: 214, magicDef: 215 },
  { level: 47, hp: 4019, atk: 76, def: 86, magicAtk: 217, magicDef: 217 },
  { level: 48, hp: 4226, atk: 78, def: 90, magicAtk: 220, magicDef: 220 },
  { level: 49, hp: 4433, atk: 80, def: 93, magicAtk: 223, magicDef: 222 },
  { level: 50, hp: 4640, atk: 82, def: 97, magicAtk: 226, magicDef: 225 },
  { level: 51, hp: 4848, atk: 84, def: 101, magicAtk: 229, magicDef: 228 },
  { level: 52, hp: 4976, atk: 86, def: 106, magicAtk: 232, magicDef: 231 },
  { level: 53, hp: 5104, atk: 88, def: 111, magicAtk: 235, magicDef: 234 },
  { level: 54, hp: 5232, atk: 91, def: 117, magicAtk: 238, magicDef: 237 },
  { level: 55, hp: 5360, atk: 93, def: 122, magicAtk: 240, magicDef: 240 },
  { level: 56, hp: 5488, atk: 95, def: 127, magicAtk: 243, magicDef: 243 },
  { level: 57, hp: 5616, atk: 97, def: 133, magicAtk: 246, magicDef: 246 },
  { level: 58, hp: 5744, atk: 100, def: 138, magicAtk: 249, magicDef: 249 },
  { level: 59, hp: 5872, atk: 102, def: 143, magicAtk: 252, magicDef: 252 },
  { level: 60, hp: 6000, atk: 104, def: 149, magicAtk: 255, magicDef: 254 },
];

/** TLoD-canonical "Shana / Miranda" XP column. LV 1-4 back-filled
 *  with Dart's values (Shana joins at LV 5 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 204, 352, 559, 835, 1189, 1632, 2172, 2820, 3585, 4478, 5508, 6684, 8018, 9517,
  11193, 13056, 15113, 17377, 19856, 22560, 25500, 28684, 32122, 35825, 39802, 44064, 48618, 53477,
  58649, 64144, 69972, 76142, 82665, 89551, 96808, 104448, 112479, 120911, 129755, 139020, 148716,
  158852, 169439, 180486, 192003, 204000, 219608, 235840, 252709, 270226, 288405, 307256, 326793,
  347028, 367973, 389640,
];

export const WHITE_SILVER_DRAGOON: DragoonArchetype = {
  id: 'whiteSilverDragoon',
  element: 'light',
  attackPattern: 'ranged',
  actionStats: {
    moveSpeed: 0.18,
    base: {
      speed: 50,
      // Slower bow draw vs a sword/lance swing.
      atkSpeed: 1.0,
      // Bow reach ≈ 3× melee range.
      range: 240,
      aggroRange: 0,
      attackHit: 95,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 5,
    },
  },
  statsByLevel: STATS_BY_LEVEL,
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // No base-form Additions in TLoD canon for this archetype —
  // Shana/Miranda use items + Dragoon spells exclusively.
  additionUnlocksByLevel: new Map(),
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.2, def: 1.2, magicAtk: 1.6, magicDef: 1.4, moveSpeed: 1.0 },
    // White-Silver Dragoon spells: Moon Light (heal), Star
    // Children, Gates of Heaven.
    additionUnlocksByLevel: new Map([
      [1, 'moonLight'],
      [10, 'starChildren'],
      [30, 'gatesOfHeavenWhite'],
    ]),
    // No additions → no SP from additions. Gain SP per
    // auto-attack instead.
    spGainPerAddition: 0,
    spGainPerAutoAttack: 5,
    spMax: 100,
  },
};
