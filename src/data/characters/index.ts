/**
 * Character registry. Engine code reads characters by id when it
 * needs to (e.g. survival's pre-run character selector); scene code
 * usually imports the const directly (`import { DART } …`).
 *
 * Add a new character by importing its def and adding it to the
 * `CHARACTERS` map. The registry is type-safe — TypeScript will
 * complain if the map's keys drift from `CharacterId`.
 */
import type { CharacterDef, CharacterId } from './types';
import { DART } from './dart';
import { LAVITZ } from './lavitz';
import { SHANA } from './shana';
import { ROSE } from './rose';
import { HASCHEL } from './haschel';
import { ALBERT } from './albert';
import { MERU } from './meru';
import { KONGOL } from './kongol';
import { MIRANDA } from './miranda';

export const CHARACTERS: Partial<Record<CharacterId, CharacterDef>> = {
  dart: DART,
  lavitz: LAVITZ,
  shana: SHANA,
  rose: ROSE,
  haschel: HASCHEL,
  albert: ALBERT,
  meru: MERU,
  kongol: KONGOL,
  miranda: MIRANDA,
};

/** Default playable character. Used as the fallback when a scene
 *  doesn't specify one in its config. */
export const DEFAULT_CHARACTER: CharacterDef = DART;

export { DART, LAVITZ, SHANA, ROSE, HASCHEL, ALBERT, MERU, KONGOL, MIRANDA };
export type {
  AttackPattern,
  CharacterDef,
  CharacterElement,
  CharacterId,
  CharacterLevelRow,
  PlaceholderProfile,
} from './types';
export {
  applyCharacterRow,
  getCharacterStatsAtLevel,
  placeholderStatsByLevel,
  xpToReachLevel,
} from './types';
