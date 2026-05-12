import type { CharacterAvatar } from '@data/characters';

/**
 * Marker component carrying the static `CharacterAvatar` for whichever
 * playable character owns the entity. Set once at spawn; mutated only
 * by Story-mode narrative beats (Lavitz dies → Albert avatar swaps in).
 *
 * Engine reads:
 *   - `character.avatar.archetype.statsByLevel` for combat stats
 *   - `character.avatar.archetype.xpToReachLevel` for XP thresholds
 *   - `character.avatar.sprite.base.idle` (or `.dragoon.*`) for
 *     rendering
 *
 * The archetype reference is direct (not an id lookup) so consumers
 * have zero indirection. Survival's avatar-swap "skin" pattern (same
 * archetype, different visual) collapses to a Character mutation.
 */
export interface Character {
  avatar: CharacterAvatar;
}
