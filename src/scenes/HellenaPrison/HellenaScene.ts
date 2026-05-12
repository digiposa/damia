import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { GameplaySnapshot, SceneConfig } from '@/engine/gameplay/SceneConfig';
import type { MapData } from '../ForestOfSeles/MapLoader';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { DART, applyCharacterRow } from '@data/characters';
import { ITEMS, type ItemKind } from '@data/items';
import { spawnItem } from '@gameplay/entities/items';
import { SaveManager, type SaveDataV5 } from '@services/SaveManager';
import { t } from '@services/I18nService';
import { WorldMapScene } from '@scenes/WorldMapScene';
import { GameOverScene } from '@scenes/GameOverScene';
import { TitleScene } from '@scenes/TitleScene';

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
 * Hellena Prison — second Story zone. Same shape as `ForestScene`: a thin
 * wrapper around `GameplayController` that owns only the bits that differ
 * from Forest (no random encounters, different placeholder map, save key
 * under 'hellena'). All gameplay plumbing lives in the shared controller.
 */
export class HellenaScene implements Scene {
  readonly name = 'hellena';
  private controller: GameplayController | null = null;

  constructor(private readonly saveData: SaveDataV5 | null = null) {}

  enter(ctx: GameContext): void {
    const fromThisZone = this.saveData?.currentZoneId === 'hellena';
    const spawnOverride =
      fromThisZone && this.saveData
        ? { gx: this.saveData.player.gx, gy: this.saveData.player.gy }
        : undefined;

    const config: SceneConfig = {
      mode: 'story',
      map: HellenaMap,
      saveData: this.saveData,
      overrides: {
        fogSaveZoneId: 'hellena',
        // No random encounters in the placeholder Hellena — only scripted
        // mobs. Encounter indicator is omitted accordingly.
        enableEncounters: false,
        showZoneTitle: true,
        showMiniMap: true,
        showActionLog: true,
        showAdditionsBar: true,
        showEncounterIndicator: false,
        showCursorOverlay: true,
        // Placeholder track until Hellena gets its own ambient.
        musicAlias: 'music.titleScreen',
        ...(spawnOverride ? { spawnOverride } : {}),
      },
      hooks: {
        unlockedAdditions: (level) => this.unlockedAdditions(level),
        onPlayerDeath: () => {
          SaveManager.clear();
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new GameOverScene('story'), ctx);
          });
        },
        onZoneExit: (_ctx, exit) => {
          if (exit.kind === 'transition' && exit.targetScene === 'world-map') {
            this.controller?.persist();
            queueMicrotask(() => {
              void ctx.scenes.switchTo(new WorldMapScene(SaveManager.load()), ctx);
            });
          } else if (exit.kind === 'blocked') {
            this.controller?.ui.toast.show(t(exit.messageKey));
          }
        },
        onQuit: () => {
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new TitleScene(), ctx);
          });
        },
        onPersist: (snapshot) => this.writeSave(snapshot),
        onDropItem: (kind) => this.dropItemToWorld(kind),
        onPickup: (kind, result, gold) => {
          if (result === 'full') return;
          const log = this.controller?.ui.actionLog;
          if (!log) return;
          if (result === 'gold' && gold !== undefined) {
            log.push(t('log.goldPicked', { gold }));
            return;
          }
          log.push(t('log.itemPicked', { item: t(ITEMS[kind].nameKey) }));
        },
      },
    };

    this.controller = new GameplayController(ctx, config);
    this.applyDartRow(fromThisZone);

    this.controller.ui.zoneTitle?.show(
      t('zones.hellenaPrison.name'),
      t('zones.hellenaPrison.objective'),
    );
  }

  exit(): void {
    this.controller?.destroy();
    this.controller = null;
  }

  update(dt: number): void {
    this.controller?.update(dt);
  }

  /** Sync Dart's `Stats` + `Health.max` to the canonical row for his
   *  current `Progression.level`. Same-zone resume keeps the saved HP;
   *  cross-zone arrivals top up to full. */
  private applyDartRow(fromThisZone: boolean): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerId = controller.playerId;
    const prog = world.getComponent(playerId, 'Progression');
    const stats = world.getComponent(playerId, 'Stats');
    const hp = world.getComponent(playerId, 'Health');
    const level = prog?.level ?? 1;
    applyCharacterRow(stats, hp, DART, level, fromThisZone);
    if (!fromThisZone && hp) hp.current = hp.max;
  }

  private unlockedAdditions(level: number): ReadonlyArray<AdditionKind> {
    const out: AdditionKind[] = [];
    for (const [unlockLv, slug] of DART.archetype.additionUnlocksByLevel) {
      if (level < unlockLv) continue;
      if (slug in ADDITIONS) out.push(slug as AdditionKind);
    }
    return out.length > 0 ? out : ['doubleSlash'];
  }

  private dropItemToWorld(kind: ItemKind): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerId = controller.playerId;
    const inv = world.getComponent(playerId, 'Inventory');
    const pos = world.getComponent(playerId, 'Position');
    if (!inv || !pos) return;
    const count = inv.items[kind] ?? 0;
    if (count <= 0) return;
    inv.items[kind] = count - 1;
    if ((inv.items[kind] ?? 0) <= 0) delete inv.items[kind];
    const id = spawnItem(world, kind, pos.x, pos.y);
    const item = world.getComponent(id, 'Item');
    if (item) item.pickableAfterMs = performance.now() + 1500;
  }

  /** Write the controller snapshot to localStorage under the 'hellena'
   *  zone key, preserving Forest's fog grid so a Forest → Hellena trip
   *  doesn't wipe the player's prior exploration. */
  private writeSave(snap: GameplaySnapshot): void {
    const existing = SaveManager.load();
    const existingFog = existing?.fogByZone ?? {};
    const hellenaFog = this.controller?.fog?.exportRevealed();
    SaveManager.save({
      currentZoneId: 'hellena',
      discoveredZones: existing?.discoveredZones ?? ['forest', 'hellena'],
      fogByZone: hellenaFog ? { ...existingFog, hellena: hellenaFog } : existingFog,
      player: {
        hp: snap.playerHp,
        maxHp: snap.playerMaxHp,
        gx: snap.playerGx,
        gy: snap.playerGy,
      },
      inventory: {
        items: { ...snap.inventory },
        gold: snap.gold,
      },
      hotbar: snap.hotbarSlots.slice(),
      progression: {
        level: snap.progressionLevel,
        xp: snap.progressionXp,
        xpToNext: snap.progressionXpToNext,
      },
      activeAddition: snap.activeAddition,
    });
  }
}
