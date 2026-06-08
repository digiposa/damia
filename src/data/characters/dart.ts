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
    // Red-Eye Dragoon form. Single pose for now — same alias drives
    // idle / attack / defend until pose variants land.
    dragoon: {
      idle: 'sprite.player.dart.dragoon',
      attack: 'sprite.player.dart.dragoon',
      defend: 'sprite.player.dart.dragoon',
    },
  },
  // TLoD canon Forest of Seles intro loadout (reverse-engineered from
  // the author's Knight of Sandora damage observations: Dart effective
  // AT 4 = base 2 + Broad Sword, effective DEF 6 = base 4 + Leather
  // Armor). Bandana + Leather Boots fill the helm/boots slots.
  startingEquipment: ['broadSword', 'bandana', 'leatherArmor', 'leatherBoots'],
};
