/**
 * Miranda — Sacred Sister of Mille Seseau, inherits Shana's
 * White-Silver Dragoon Spirit in Disc 3. Same archetype as Shana,
 * different avatar.
 */
import type { CharacterAvatar } from './types';
import { WHITE_SILVER_DRAGOON } from './archetypes';

export const MIRANDA: CharacterAvatar = {
  id: 'miranda',
  displayNameKey: 'character.miranda.name',
  archetype: WHITE_SILVER_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.miranda',
      attack: 'sprite.player.miranda.attack',
      defend: 'sprite.player.miranda.defend',
    },
    dragoon: {
      idle: 'sprite.player.miranda',
      attack: 'sprite.player.miranda.attack',
      defend: 'sprite.player.miranda.defend',
    },
  },
  unlock: { wave: 28, kills: 300 },
};
