/**
 * Miranda — White-Silver Dragoon (Light), Sacred Sister of
 * Mille Seseau. Inherits Shana's Dragoon Spirit. Bow ranged
 * attacks + light magic, similar archetype to Shana.
 *
 * Shares Shana's canonical XP column in TLoD's tables. Stat
 * table is procedural placeholder.
 */
import type { CharacterDef } from './types';
import { SHANA_STATS_BY_LEVEL } from './shana';

/** Cumulative XP to reach each level — same column as Shana. */
const MIRANDA_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 20, 43, 102, 204, 352, 559, 835, 1189, 1632, 2172, 2820, 3585, 4478, 5508, 6684, 8018, 9517,
  11193, 13056, 15113, 17377, 19856, 22560, 25500, 28684, 32122, 35825, 39802, 44064, 48618, 53477,
  58649, 64144, 69972, 76142, 82665, 89551, 96808, 104448, 112479, 120911, 129755, 139020, 148716,
  158852, 169439, 180486, 192003, 204000, 219608, 235840, 252709, 270226, 288405, 307256, 326793,
  347028, 367973, 389640,
];

export const MIRANDA: CharacterDef = {
  id: 'miranda',
  displayNameKey: 'character.miranda.name',
  element: 'light',
  attackPattern: 'ranged',
  actionStats: {
    // Slightly faster than Shana — Miranda is described as more
    // forward + assertive in TLoD lore.
    moveSpeed: 0.19,
    base: {
      speed: 52,
      atkSpeed: 1.1,
      range: 240,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 5,
    },
  },
  // Miranda shares Shana's canonical stat row in TLoD's tables
  // (both are the Light / White-Silver Dragoon archetype) — reuse
  // the same const so the two stay perfectly in sync.
  statsByLevel: SHANA_STATS_BY_LEVEL,
  xpToReachLevel: MIRANDA_XP_TO_REACH_LEVEL,
  // Miranda uses Items + White-Silver Dragoon spells, same as
  // Shana. No Additions.
  additionUnlocksByLevel: new Map(),
  sprite: {
    idle: 'sprite.player.miranda',
    attack: 'sprite.player.miranda.attack',
    defend: 'sprite.player.miranda.defend',
    additions: {},
  },
};
