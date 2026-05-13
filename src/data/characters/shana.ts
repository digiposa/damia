/**
 * Shana — Dart's childhood friend, first bearer of the White-
 * Silver Dragoon Spirit in canon. Miranda inherits it in Disc 3.
 */
import type { CharacterAvatar } from './types';
import { WHITE_SILVER_DRAGOON } from './archetypes';

export const SHANA: CharacterAvatar = {
  id: 'shana',
  displayNameKey: 'character.shana.name',
  archetype: WHITE_SILVER_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.shana',
      attack: 'sprite.player.shana.attack',
      defend: 'sprite.player.shana.defend',
    },
    dragoon: {
      idle: 'sprite.player.shana',
      attack: 'sprite.player.shana.attack',
      defend: 'sprite.player.shana.defend',
    },
  },
  unlock: { wave: 5 },
  // TLoD canon: Shana joins the party at LV5 (Hellena Prison).
  joinLevel: 5,
  // Initial loadout: Short Bow + Clothes + Leather Shoes. No starter
  // helmet for female chars (Felt Hat unlocks at Hellena 2nd visit,
  // not earlier).
  startingEquipment: ['shortBow', 'clothes', 'leatherShoes'],
};
