/**
 * Dark Burst Dragoon — Darkness element. Rapier melee, agile,
 * balanced stats with a magic edge. Rose is the only known
 * bearer in canon (she's held the spirit for 11 000 years).
 *
 * XP curve is TLoD-canonical (Rose column). Stat row stays
 * placeholder pending the source `stats.txt` for Rose — swap the
 * `placeholderStatsByLevel(…)` call below with a literal
 * `ReadonlyArray<CharacterLevelRow>` when on hand.
 */
import type { DragoonArchetype } from '../types';
import { placeholderStatsByLevel } from '../helpers';

/** TLoD-canonical "Rose" XP column. LV 1-8 back-filled with
 *  Dart's values (Rose joins at LV 9 in TLoD). */
const XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1193, 1636, 2178, 2828, 3596, 4491, 5524, 6704, 8041, 9545,
  11226, 13094, 15158, 17428, 19914, 22627, 25575, 28768, 32217, 35931, 39919, 44193, 48761, 53634,
  58321, 64332, 70177, 76366, 82908, 89814, 97093, 104755, 112809, 121267, 130137, 139429, 149153,
  159319, 169937, 181016, 192567, 204600, 220253, 236533, 253452, 271021, 289253, 308160, 327754,
  348049, 369055, 390786,
];

export const DARK_BURST_DRAGOON: DragoonArchetype = {
  id: 'darkBurstDragoon',
  element: 'darkness',
  attackPattern: 'melee',
  actionStats: {
    moveSpeed: 0.2,
    base: {
      speed: 55,
      atkSpeed: 1.7,
      range: 88,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 8,
      magicAvoid: 5,
    },
  },
  // TODO: replace with the canonical TLoD Rose stat row when on hand.
  statsByLevel: placeholderStatsByLevel({
    baseHp: 28,
    hpPerLevel: 25,
    hpMidGameBonus: 40,
    baseAtk: 2,
    atkPerLevel: 2.1,
    baseDef: 4,
    defPerLevel: 1.9,
    baseMagicAtk: 3,
    magicAtkPerLevel: 2.2,
    baseMagicDef: 4,
    magicDefPerLevel: 2.1,
  }),
  xpToReachLevel: XP_TO_REACH_LEVEL,
  // Rose's TLoD Additions: Whip Smack, More & More, Hard Blade,
  // Demon's Dance. Slugs not in ADDITIONS yet.
  additionUnlocksByLevel: new Map([
    [1, 'whipSmack'],
    [8, 'moreAndMore'],
    [15, 'hardBlade'],
    [22, 'demonsDance'],
  ]),
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.4, def: 1.3, magicAtk: 1.5, magicDef: 1.3, hp: 1.0, moveSpeed: 1.15 },
    // Dark Burst Dragoon spells: Astral Drain, Demon's Gate,
    // Death Dimension.
    additionUnlocksByLevel: new Map([
      [1, 'astralDrain'],
      [10, 'demonsGate'],
      [30, 'deathDimension'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
