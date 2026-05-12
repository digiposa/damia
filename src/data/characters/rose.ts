/**
 * Rose — Black Burst Dragoon (Darkness), 11 000-year-old veteran
 * of the Dragon Campaign. Rapier melee, fast strikes, balanced
 * stats with a magic edge. Joins at LV9 in TLoD.
 *
 * Sprite placeholders point at Dart until the dedicated PNG lands.
 * Stat table is procedural placeholder.
 */
import type { CharacterDef } from './types';
import { placeholderStatsByLevel } from './types';

/**
 * Cumulative XP to reach each level — TLoD canonical "Rose" column.
 * Levels 1-8 back-filled with Dart's values (Rose joins at LV9 in
 * the original; Survival starts at LV1 universally).
 */
const ROSE_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1193, 1636, 2178, 2828, 3596, 4491, 5524, 6704, 8041, 9545,
  11226, 13094, 15158, 17428, 19914, 22627, 25575, 28768, 32217, 35931, 39919, 44193, 48761, 53634,
  58321, 64332, 70177, 76366, 82908, 89814, 97093, 104755, 112809, 121267, 130137, 139429, 149153,
  159319, 169937, 181016, 192567, 204600, 220253, 236533, 253452, 271021, 289253, 308160, 327754,
  348049, 369055, 390786,
];

export const ROSE: CharacterDef = {
  id: 'rose',
  displayNameKey: 'character.rose.name',
  element: 'darkness',
  attackPattern: 'melee',
  actionStats: {
    // Faster than Dart — rapier + experience.
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
  xpToReachLevel: ROSE_XP_TO_REACH_LEVEL,
  // Rose's TLoD Additions: Whip Smack, More & More, Hard Blade,
  // Demon's Dance.
  additionUnlocksByLevel: new Map([
    [1, 'whipSmack'],
    [8, 'moreAndMore'],
    [15, 'hardBlade'],
    [22, 'demonsDance'],
  ]),
  sprite: {
    idle: 'sprite.player.rose',
    attack: 'sprite.player.rose.attack',
    defend: 'sprite.player.rose.defend',
    additions: {},
  },
};
