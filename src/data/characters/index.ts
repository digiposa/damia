/**
 * Public character registry. Two layers:
 *
 *  - `ARCHETYPES`: the 7 Dragoon Spirits (mechanical classes).
 *    Stats / XP / additions / dragoon config live here.
 *  - `AVATARS`: the 9 playable faces. Each references one
 *    archetype + adds sprite, id, unlock criterion.
 *
 * Engine reads via `Character.avatar` on the player entity:
 *   - `avatar.archetype.statsByLevel[level]` for combat stats
 *   - `avatar.sprite.base.idle` (or `.dragoon.idle` when
 *     transformed) for rendering
 *   - `avatar.archetype.additionUnlocksByLevel` for the
 *     AdditionsBar pool
 *
 * Back-compat aliases (CharacterDef = CharacterAvatar,
 * CharacterId = AvatarId, CHARACTERS = AVATARS) keep older
 * consumer code compiling while the migration lands.
 */
import type { AvatarId, CharacterAvatar } from './types';
import { ARCHETYPES } from './archetypes';
import { DART } from './dart';
import { LAVITZ } from './lavitz';
import { ALBERT } from './albert';
import { SHANA } from './shana';
import { MIRANDA } from './miranda';
import { ROSE } from './rose';
import { HASCHEL } from './haschel';
import { MERU } from './meru';
import { KONGOL } from './kongol';

export const AVATARS: Partial<Record<AvatarId, CharacterAvatar>> = {
  dart: DART,
  lavitz: LAVITZ,
  albert: ALBERT,
  shana: SHANA,
  miranda: MIRANDA,
  rose: ROSE,
  haschel: HASCHEL,
  meru: MERU,
  kongol: KONGOL,
};

/** Default playable avatar — Dart. Used as a fallback when a
 *  scene config doesn't specify one. */
export const DEFAULT_AVATAR: CharacterAvatar = DART;

export { ARCHETYPES, DART, LAVITZ, ALBERT, SHANA, MIRANDA, ROSE, HASCHEL, MERU, KONGOL };

// Back-compat aliases — external consumers (scenes, components,
// services) still import these names. Keep them as a soft
// migration path; can be deleted in a follow-up sweep.

/** @deprecated Use `AVATARS`. */
export const CHARACTERS = AVATARS;

/** @deprecated Use `DEFAULT_AVATAR`. */
export const DEFAULT_CHARACTER = DEFAULT_AVATAR;

export type {
  ArchetypeId,
  AttackPattern,
  AvatarId,
  CharacterAvatar,
  CharacterElement,
  CharacterLevelRow,
  DragoonArchetype,
  DragoonConfig,
  DragoonStatsMultiplier,
  UnlockCriterion,
} from './types';
export {
  applyArchetypeRow,
  applyCharacterRow,
  getCharacterStatsAtLevel,
  xpToReachLevel,
} from './types';

/** @deprecated Use `CharacterAvatar`. */
export type CharacterDef = CharacterAvatar;
/** @deprecated Use `AvatarId`. */
export type CharacterId = AvatarId;

/** @deprecated Re-export from `helpers` for legacy callers. */
export type { PlaceholderProfile } from './helpers';
export { placeholderStatsByLevel } from './helpers';
