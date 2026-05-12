import type { CharacterDef } from '@data/characters';

/**
 * Marker component carrying the static `CharacterDef` for whichever
 * playable character owns the entity. Set once at spawn, never
 * mutated mid-run. DeathSystem reads it to know which stat row + XP
 * curve to apply on level-up; scenes read it for displayNameKey
 * lookup; the future ranged/melee CombatSystem branches off
 * `def.attackPattern`.
 *
 * The reference is to the canonical static object (not a copy), so
 * there's zero per-entity memory cost.
 */
export interface Character {
  def: CharacterDef;
}
