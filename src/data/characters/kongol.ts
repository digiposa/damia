/**
 * Kongol — last Giganto warrior, Golden Dragoon (Earth). Huge axe
 * melee. Enormous HP + ATK + DEF, very slow movement and atkSpeed,
 * minimal magic. Joins at LV20 in TLoD — the latest joiner from
 * the standard party.
 *
 * Sprite placeholders point at Dart until the dedicated PNG lands.
 * Stat table is procedural placeholder.
 */
import type { CharacterDef } from './types';
import { placeholderStatsByLevel } from './types';

/**
 * Cumulative XP to reach each level — TLoD canonical "Kongol"
 * column. Levels 1-19 back-filled with Dart's values (Kongol
 * joins at LV20 in the original).
 */
const KONGOL_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 200, 345, 548, 819, 1166, 1600, 2129, 2764, 3515, 4390, 5400, 6553, 7860, 9331,
  10947, 13017, 15069, 17326, 19798, 22494, 25425, 28599, 32028, 35720, 39685, 43934, 48475, 53320,
  58476, 63955, 69766, 75918, 82422, 89287, 96523, 104140, 112148, 120555, 129373, 138611, 148278,
  158385, 168940, 179955, 191438, 203400, 218962, 235146, 251965, 269431, 287556, 306352, 325832,
  346007, 366890, 388494,
];

export const KONGOL: CharacterDef = {
  id: 'kongol',
  displayNameKey: 'character.kongol.name',
  element: 'earth',
  attackPattern: 'melee',
  actionStats: {
    // Slowest in the roster. He's a wall.
    moveSpeed: 0.13,
    base: {
      speed: 35,
      // Heavy axe windup.
      atkSpeed: 0.7,
      // Big axe reach.
      range: 108,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 0,
      magicAvoid: 0,
    },
  },
  // TODO: replace with the canonical TLoD Kongol stat row. Profile:
  // monstrous HP/ATK/DEF, anemic magic.
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
  xpToReachLevel: KONGOL_XP_TO_REACH_LEVEL,
  // Kongol's TLoD Additions: Pursuit, Inferno. Smaller set than
  // the other dragoons — he's the late joiner.
  additionUnlocksByLevel: new Map([
    [1, 'pursuit'],
    [8, 'inferno'],
  ]),
  sprite: {
    idle: 'sprite.player.kongol',
    attack: 'sprite.player.kongol.attack',
    defend: 'sprite.player.kongol.defend',
    additions: {},
  },
};
