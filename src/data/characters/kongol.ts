/**
 * Kongol — last surviving Giganto, bearer of the Golden Dragoon
 * Spirit. The roster's wall.
 */
import type { CharacterAvatar } from './types';
import { GOLDEN_DRAGOON } from './archetypes';

export const KONGOL: CharacterAvatar = {
  id: 'kongol',
  displayNameKey: 'character.kongol.name',
  archetype: GOLDEN_DRAGOON,
  sprite: {
    base: {
      idle: 'sprite.player.kongol',
      attack: 'sprite.player.kongol.attack',
      defend: 'sprite.player.kongol.defend',
    },
    dragoon: {
      idle: 'sprite.player.kongol',
      attack: 'sprite.player.kongol.attack',
      defend: 'sprite.player.kongol.defend',
    },
  },
  unlock: { wave: 22, kills: 220 },
  // TLoD canon: Kongol joins the party at LV20 (Disc 2 ending).
  joinLevel: 20,
};
