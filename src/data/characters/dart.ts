/**
 * Dart Feld — TLoD protagonist, sole bearer of the Red-Eye Dragoon
 * Spirit in canon (Zieg held it before — future Survival skin).
 * Sprite + ID + lore live here; mechanical class is on
 * `RED_EYE_DRAGOON`.
 */
import type { CharacterAvatar } from './types';
import { RED_EYE_DRAGOON } from './archetypes';

export const DART: CharacterAvatar = {
  id: 'dart',
  displayNameKey: 'character.dart.name',
  archetype: RED_EYE_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.dart',
      attack: 'sprite.player.dart.attack',
      defend: 'sprite.player.dart.defend',
      additions: {
        // Double Slash: 1st hit reuses the attack pose, 2nd hit
        // uses the dedicated sprite. RenderSystem swaps frames by
        // progress fraction.
        doubleSlash: ['sprite.player.dart.attack', 'sprite.player.dart.doubleSlash.2'],
      },
    },
    // Placeholder — Dragoon form sprites for Dart not generated
    // yet, reuse the base. Commit 4 of the character refactor
    // swaps these to dedicated PNGs.
    dragoon: {
      idle: 'sprite.player.dart',
      attack: 'sprite.player.dart.attack',
      defend: 'sprite.player.dart.defend',
    },
  },
};
