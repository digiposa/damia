/**
 * Registry of the seven TLoD Dragoon archetypes. Multiple avatars
 * can share an archetype (Lavitz + Albert + Graham → Jade Dragoon;
 * Shana + Miranda + Shirley → White-Silver Dragoon).
 */
import type { ArchetypeId, DragoonArchetype } from '../types';
import { RED_EYE_DRAGOON } from './redEyeDragoon';
import { JADE_DRAGOON } from './jadeDragoon';
import { WHITE_SILVER_DRAGOON } from './whiteSilverDragoon';
import { DARK_BURST_DRAGOON } from './darkBurstDragoon';
import { VIOLET_DRAGOON } from './violetDragoon';
import { BLUE_SEA_DRAGOON } from './blueSeaDragoon';
import { GOLDEN_DRAGOON } from './goldenDragoon';

export const ARCHETYPES: Record<ArchetypeId, DragoonArchetype> = {
  redEyeDragoon: RED_EYE_DRAGOON,
  jadeDragoon: JADE_DRAGOON,
  whiteSilverDragoon: WHITE_SILVER_DRAGOON,
  darkBurstDragoon: DARK_BURST_DRAGOON,
  violetDragoon: VIOLET_DRAGOON,
  blueSeaDragoon: BLUE_SEA_DRAGOON,
  goldenDragoon: GOLDEN_DRAGOON,
};

export {
  RED_EYE_DRAGOON,
  JADE_DRAGOON,
  WHITE_SILVER_DRAGOON,
  DARK_BURST_DRAGOON,
  VIOLET_DRAGOON,
  BLUE_SEA_DRAGOON,
  GOLDEN_DRAGOON,
};
