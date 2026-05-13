/**
 * Lavitz Slambert — first Jade Dragoon in TLoD canon, killed by
 * Lloyd in Disc 2. Story-mode death triggers a swap to Albert
 * who inherits the spirit (same archetype, different avatar).
 */
import type { CharacterAvatar } from './types';
import { JADE_DRAGOON } from './archetypes';

export const LAVITZ: CharacterAvatar = {
  id: 'lavitz',
  displayNameKey: 'character.lavitz.name',
  archetype: JADE_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.lavitz',
      attack: 'sprite.player.lavitz.attack',
      defend: 'sprite.player.lavitz.defend',
      additions: {
        harpoon: ['sprite.player.lavitz.attack', 'sprite.player.lavitz.harpoon.2'],
      },
    },
    // Jade-armor dragoon-form sprite is still pending. Reuse base meanwhile.
    dragoon: {
      idle: 'sprite.player.lavitz',
      attack: 'sprite.player.lavitz.attack',
      defend: 'sprite.player.lavitz.defend',
    },
  },
  unlock: { wave: 7, kills: 25 },
  // TLoD canon: Lavitz joins the Forest of Seles party at LV4.
  joinLevel: 4,
};
