/**
 * Rose — 11 000-year-old bearer of the Dark Burst (Shadow)
 * Dragoon Spirit, veteran of the Dragon Campaign.
 */
import type { CharacterAvatar } from './types';
import { DARK_BURST_DRAGOON } from './archetypes';

export const ROSE: CharacterAvatar = {
  id: 'rose',
  displayNameKey: 'character.rose.name',
  archetype: DARK_BURST_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.rose',
      attack: 'sprite.player.rose.attack',
      defend: 'sprite.player.rose.defend',
    },
    dragoon: {
      idle: 'sprite.player.rose',
      attack: 'sprite.player.rose.attack',
      defend: 'sprite.player.rose.defend',
    },
  },
  unlock: { wave: 12, kills: 80 },
};
