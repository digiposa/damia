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
      // 3-frame basic-attack animation (wind-up → strike → follow-through).
      // RenderSystem splits AttackSwing duration evenly across the array,
      // falling back to the single `attack` alias when this is absent.
      attackFrames: [
        'sprite.player.dart.attack.1',
        'sprite.player.dart.attack.2',
        'sprite.player.dart.attack.3',
      ],
      // 2-frame walk cycle. RenderSystem swaps between these while Dart
      // has active pathfinder waypoints — see the AvatarSpriteForm doc
      // on walkFrames for fallback behaviour.
      walkFrames: ['sprite.player.dart.walk.1', 'sprite.player.dart.walk.2'],
      additions: {
        // Double Slash: TLoD-canon two-hit chain — the basic 3-frame
        // swing (wind-up → strike → follow-through) flows directly into
        // the dedicated 2-frame follow-up (back-wind → arc + VFX trail).
        // RenderSystem splits the Addition.totalMs evenly across the 5
        // frames, so the animation reads as one fluid double slash
        // rather than two disconnected hits.
        doubleSlash: [
          'sprite.player.dart.attack.1',
          'sprite.player.dart.attack.2',
          'sprite.player.dart.attack.3',
          'sprite.player.dart.doubleSlash.1',
          'sprite.player.dart.doubleSlash.2',
        ],
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
