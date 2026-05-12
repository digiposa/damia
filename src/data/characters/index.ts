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
import { SHANA } from './shana';

export const CHARACTERS: Partial<Record<CharacterId, CharacterDef>> = {
  dart: DART,
  shana: SHANA,
};

/** Default playable character. Used as the fallback when a scene
 *  doesn't specify one in its config. */
export const DEFAULT_CHARACTER: CharacterDef = DART;

export { DART, SHANA };
export type { CharacterDef, CharacterId, CharacterElement, AttackPattern } from './types';
export { applyCharacterRow, getCharacterStatsAtLevel, xpToReachLevel } from './types';
