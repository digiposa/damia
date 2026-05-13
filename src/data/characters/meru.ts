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
};
