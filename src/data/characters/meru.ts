/**
 * Meru — Wingly dancer, current bearer of the Blue-Sea Dragoon
 * Spirit. Damia held it during the Dragon Campaign (Survival
 * skin pending).
 */
import type { CharacterAvatar } from './types';
import { BLUE_SEA_DRAGOON } from './archetypes';

export const MERU: CharacterAvatar = {
  id: 'meru',
  displayNameKey: 'character.meru.name',
  archetype: BLUE_SEA_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.meru',
      attack: 'sprite.player.meru.attack',
      defend: 'sprite.player.meru.defend',
    },
    dragoon: {
      idle: 'sprite.player.meru',
      attack: 'sprite.player.meru.attack',
      defend: 'sprite.player.meru.defend',
    },
  },
  unlock: { wave: 10, kills: 50 },
  // TLoD canon: Meru joins the party at LV18 (Donau / Furni arc).
  joinLevel: 18,
  // Initial loadout: Mace + Clothes (female regular armor) + Leather
  // Shoes. No starter helmet (Felt Hat is the early female helm but
  // unlocks at Hellena 2nd visit, before Meru joins — kept off the
  // join loadout for simplicity).
  startingEquipment: ['mace', 'clothes', 'leatherShoes'],
};
