/**
 * Dart Feld — protagonist of TLoD, future Fire Dragoon. The data
 * tables (`DART_STATS_BY_LEVEL`, `DART_XP_TO_REACH_LEVEL`,
 * `DART_ADDITION_UNLOCKS_BY_LEVEL`) still live in `src/data/dart.ts`
 * as the canonical source — this file just wraps them into the
 * generic `CharacterDef` shape the engine reads.
 *
 * Action-RPG-only fields (atkSpeed, range, hit/avoid percentages,
 * SPEED scalar, move speed) come from the legacy `PLAYER_BASE`
 * constants in `balance.ts`. Once every caller migrates to reading
 * via `CharacterDef`, we can deprecate `PLAYER_BASE` entirely.
 */
import {
  DART_ADDITION_UNLOCKS_BY_LEVEL,
  DART_STATS_BY_LEVEL,
  DART_XP_TO_REACH_LEVEL,
} from '@data/dart';
import { PLAYER_BASE } from '@data/balance';
import type { CharacterDef } from './types';

export const DART: CharacterDef = {
  id: 'dart',
  displayNameKey: 'character.dart.name',
  element: 'fire',
  attackPattern: 'melee',
  actionStats: {
    moveSpeed: PLAYER_BASE.speed,
    base: {
      speed: PLAYER_BASE.stats.speed,
      atkSpeed: PLAYER_BASE.stats.atkSpeed,
      range: PLAYER_BASE.stats.range,
      aggroRange: PLAYER_BASE.stats.aggroRange,
      attackHit: PLAYER_BASE.stats.attackHit,
      magicHit: PLAYER_BASE.stats.magicHit,
      attackAvoid: PLAYER_BASE.stats.attackAvoid,
      magicAvoid: PLAYER_BASE.stats.magicAvoid,
    },
  },
  statsByLevel: DART_STATS_BY_LEVEL,
  xpToReachLevel: DART_XP_TO_REACH_LEVEL,
  additionUnlocksByLevel: DART_ADDITION_UNLOCKS_BY_LEVEL,
  sprite: {
    idle: 'sprite.player.dart',
    attack: 'sprite.player.dart.attack',
    defend: 'sprite.player.dart.defend',
    additions: {
      // Double Slash: 1st hit = regular attack pose, 2nd hit = dedicated
      // sprite. RenderSystem swaps frames by progress fraction.
      doubleSlash: ['sprite.player.dart.attack', 'sprite.player.dart.doubleSlash.2'],
    },
  },
};
