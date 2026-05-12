/**
 * Albert — King of Serdio, inherits the Jade Dragoon Spirit from
 * Lavitz mid-Disc 2. Same archetype, different avatar (sprite +
 * id + lore). Story-mode swap: when Lavitz dies, the player's
 * Character.avatar gets mutated to ALBERT; level / xp / progress
 * stay because archetype is identical.
 */
import type { CharacterAvatar } from './types';
import { JADE_DRAGOON } from './archetypes';

export const ALBERT: CharacterAvatar = {
  id: 'albert',
  displayNameKey: 'character.albert.name',
  archetype: JADE_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.albert',
      attack: 'sprite.player.albert.attack',
      defend: 'sprite.player.albert.defend',
    },
    dragoon: {
      idle: 'sprite.player.albert',
      attack: 'sprite.player.albert.attack',
      defend: 'sprite.player.albert.defend',
    },
  },
  unlock: { wave: 18, kills: 160 },
};
