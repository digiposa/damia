/**
 * Red-Eye Dragoon — Fire element. TLoD's protagonist class
 * (Dart in canon; Zieg historically). Balanced sword melee with
 * the canonical Dart stat row.
 */
import {
  DART_ADDITION_UNLOCKS_BY_LEVEL,
  DART_STATS_BY_LEVEL,
  DART_XP_TO_REACH_LEVEL,
} from '@data/dart';
import { PLAYER_BASE } from '@data/balance';
import type { DragoonArchetype } from '../types';

export const RED_EYE_DRAGOON: DragoonArchetype = {
  id: 'redEyeDragoon',
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
  masterAddition: 'blazingDynamo',
  // Placeholder dragoon config — same shape across all archetypes
  // for v1, will tune per-archetype once SP/transform combat lands.
  dragoon: {
    durationMsBase: 15_000,
    durationMsPerLevel: 500,
    drainPerActionMs: 1500,
    statsMultiplier: { atk: 1.3, def: 1.3, magicAtk: 1.5, magicDef: 1.3, hp: 1.0, moveSpeed: 1.15 },
    additionUnlocksByLevel: new Map([
      // TLoD canonical dragoon spells for Red-Eye: Flame Shot,
      // Explosion, Final Burst. Slugs not declared in ADDITIONS
      // yet — consumers filter at use time.
      [1, 'flameShot'],
      [10, 'explosion'],
      [30, 'finalBurst'],
    ]),
    spGainPerAddition: 25,
    spGainPerAutoAttack: 0,
    spMax: 100,
  },
};
