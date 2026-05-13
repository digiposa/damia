/**
 * Haschel — elder martial-arts master, bearer of the Violet
 * Dragoon Spirit. Joins late in Disc 1.
 */
import type { CharacterAvatar } from './types';
import { VIOLET_DRAGOON } from './archetypes';

export const HASCHEL: CharacterAvatar = {
  id: 'haschel',
  displayNameKey: 'character.haschel.name',
  archetype: VIOLET_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.haschel',
      attack: 'sprite.player.haschel.attack',
      defend: 'sprite.player.haschel.defend',
    },
    dragoon: {
      idle: 'sprite.player.haschel',
      attack: 'sprite.player.haschel.attack',
      defend: 'sprite.player.haschel.defend',
    },
  },
  unlock: { wave: 15, kills: 120 },
  // TLoD canon: Haschel joins the party at LV14 (Lohan tournament).
  joinLevel: 14,
};
