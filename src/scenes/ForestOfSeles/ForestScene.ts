import type { SceneOverrides } from '@/engine/gameplay/SceneConfig';
import { ForestMap, type MapData } from './MapLoader';
import { DART, xpToReachLevel } from '@data/characters';
import { applyLevelStats } from '@gameplay/stats';
import { t } from '@services/I18nService';
import { StorySceneBase, type StoryZoneId } from '@scenes/StorySceneBase';

/**
 * Forest of Seles — first Story zone. Everything generic lives in
 * `StorySceneBase`; Forest only supplies its data (map, asset tags,
 * encounter/music overrides, zone-title strings) and the fresh-game dev
 * loadout.
 */
export class ForestScene extends StorySceneBase {
  // Forest needs its tiles + props + the merchant NPC + Dart's full
  // sprite kit + the random-encounter mob pool. EncounterSystem rolls
  // from this set, and TLoD canon has them all spawnable from the first
  // wander, so we load them all upfront — no late surprises.
  readonly requiredTags = [
    'zone:forest',
    'player:dart',
    'mob:berserkMouse',
    'mob:goblin',
    'mob:assassinCock',
    'mob:trent',
  ] as const;

  protected readonly zoneId: StoryZoneId = 'forest';

  protected getMap(): MapData {
    return ForestMap;
  }

  protected zoneOverrides(): SceneOverrides {
    return {
      encounterZoneId: 'forest',
      enableEncounters: true,
      showEncounterIndicator: true,
      musicAlias: 'music.forestAmbient',
    };
  }

  protected zoneTitle(): { name: string; objective: string } {
    return {
      name: t('zones.forestOfSeles.name'),
      objective: t('zones.forestOfSeles.objective'),
    };
  }

  /** Dev loadout for fresh runs: force LV5 + canonical stats, prefill a
   *  pair of usable items + bind them to hotbar slots. Removed once the
   *  full progression loop ships. */
  protected override onFreshGame(): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const { world, playerId } = controller;
    const prog = world.getComponent(playerId, 'Progression');
    if (prog) {
      prog.level = 5;
      prog.xp = xpToReachLevel(DART.archetype, 5);
      prog.xpToNext = xpToReachLevel(DART.archetype, 6);
    }
    // Shared helper applies the row + re-adds equipment + heals to full.
    applyLevelStats(world, playerId, 5);
    const inv = world.getComponent(playerId, 'Inventory');
    if (inv) {
      inv.items.healingPotion = 5;
      inv.items.burnOut = 3;
    }
    controller.hotbarSlots[1] = { kind: 'item', item: 'healingPotion' };
    controller.hotbarSlots[2] = { kind: 'item', item: 'burnOut' };
  }
}
