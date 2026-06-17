import type { SceneOverrides } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '../ForestOfSeles/MapLoader';
import { t } from '@services/I18nService';
import { StorySceneBase, type StoryZoneId } from '@scenes/StorySceneBase';

/**
 * Inline placeholder map for Hellena Prison. 16×16 grid with a vertical
 * corridor and an exit at the top that returns to the WorldMap. No NPC, no
 * random encounters yet — just a few mobs to brawl with so the zone is
 * functional. Replace with a proper map.json once Hellena gets real assets.
 */
const HellenaMap: MapData = {
  name: 'Hellena Prison',
  fov: true,
  size: { w: 16, h: 16 },
  spawn: { gx: 8, gy: 14 },
  pathZones: [{ x: 7, y: 0, w: 2, h: 16 }],
  props: [
    // Stone "walls" along both sides of the corridor — uses the rock prop
    // kind as a placeholder until prison-specific assets land.
    { kind: 'rock', gx: 5, gy: 4 },
    { kind: 'rock', gx: 10, gy: 4 },
    { kind: 'rock', gx: 5, gy: 9 },
    { kind: 'rock', gx: 10, gy: 9 },
  ],
  exits: [{ kind: 'transition', gx: 8, gy: 0, targetScene: 'world-map' }],
  mobs: [
    { kind: 'goblin', gx: 8, gy: 6 },
    { kind: 'goblin', gx: 8, gy: 9 },
  ],
  interactables: [],
};

/**
 * Hellena Prison — second Story zone. Same shape as `ForestScene`: all
 * generic plumbing lives in `StorySceneBase`; Hellena only differs in its
 * placeholder map, asset tags and the no-random-encounters overrides.
 */
export class HellenaScene extends StorySceneBase {
  // Placeholder Hellena has only two scripted goblins + Dart. No random
  // encounters yet. When a real Hellena tile/prop set lands it gets its
  // own `zone:hellena` tag here; until then the rock prop drawings come
  // from RenderSystem's Graphics fallbacks.
  readonly requiredTags = ['player:dart', 'mob:goblin'] as const;

  protected readonly zoneId: StoryZoneId = 'hellena';

  protected getMap(): MapData {
    return HellenaMap;
  }

  protected zoneOverrides(): SceneOverrides {
    return {
      // No random encounters in the placeholder Hellena — only scripted
      // mobs, so the encounter indicator is omitted too.
      enableEncounters: false,
      showEncounterIndicator: false,
      // Placeholder track until Hellena gets its own ambient.
      musicAlias: 'music.titleScreen',
    };
  }

  protected zoneTitle(): { name: string; objective: string } {
    return {
      name: t('zones.hellenaPrison.name'),
      objective: t('zones.hellenaPrison.objective'),
    };
  }
}
