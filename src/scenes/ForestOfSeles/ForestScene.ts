import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { GameplaySnapshot, SceneConfig } from '@/engine/gameplay/SceneConfig';
import { ForestMap } from './MapLoader';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { applyDartRow, DART_ADDITION_UNLOCKS_BY_LEVEL } from '@data/dart';
import { xpThresholdForLevel } from '@data/progression';
import { ITEMS, type ItemKind } from '@data/items';
import { spawnItem } from '@gameplay/entities/items';
import { SaveManager, type SaveDataV5 } from '@services/SaveManager';
import { t } from '@services/I18nService';
import { WorldMapScene } from '@scenes/WorldMapScene';
import { GameOverScene } from '@scenes/GameOverScene';
import { TitleScene } from '@scenes/TitleScene';

/**
 * Forest of Seles — first Story zone. The scene is a thin wrapper around
 * `GameplayController`; all simulation, rendering and UI plumbing lives
 * there. Forest only owns the scene-specific bits:
 *
 *   • Per-zone save record (read on enter, written on persist/exit).
 *   • Dart's character data: TLoD stat row at the current level + the
 *     addition unlock schedule the AdditionsBar reads.
 *   • Drop-to-world plumbing for the inventory panel — Forest spawns a
 *     pickable Item entity on the ground, Survival no-ops.
 *   • Routing of player-death / zone-exit / quit-to-title events.
 */
export class ForestScene implements Scene {
  readonly name = 'forest';
  private controller: GameplayController | null = null;

  constructor(private readonly saveData: SaveDataV5 | null = null) {}

  enter(ctx: GameContext): void {
    const fromThisZone = this.saveData?.currentZoneId === 'forest';
    const spawnOverride =
      fromThisZone && this.saveData
        ? { gx: this.saveData.player.gx, gy: this.saveData.player.gy }
        : undefined;

    const config: SceneConfig = {
      mode: 'story',
      map: ForestMap,
      saveData: this.saveData,
      overrides: {
        encounterZoneId: 'forest',
        fogSaveZoneId: 'forest',
        enableEncounters: true,
        showZoneTitle: true,
        showMiniMap: true,
        showActionLog: true,
        showAdditionsBar: true,
        showEncounterIndicator: true,
        showCursorOverlay: true,
        musicAlias: 'music.forestAmbient',
        ...(spawnOverride ? { spawnOverride } : {}),
      },
      hooks: {
        unlockedAdditions: (level) => this.unlockedAdditions(level),
        onPlayerDeath: () => {
          // Wipe the save so "Continue" doesn't restore a doomed state.
          SaveManager.clear();
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new GameOverScene('story'), ctx);
          });
        },
        onZoneExit: (_ctx, exit) => {
          if (exit.kind === 'transition' && exit.targetScene === 'world-map') {
            // Persist now so the world map's SaveManager.load() reflects
            // the latest grid / inventory state. The controller's destroy
            // will fire onPersist again on scene switch — idempotent.
            this.controller?.persist();
            queueMicrotask(() => {
              void ctx.scenes.switchTo(new WorldMapScene(SaveManager.load()), ctx);
            });
          } else if (exit.kind === 'blocked') {
            this.controller?.ui.toast.show(t(exit.messageKey));
          }
        },
        onQuit: () => {
          // The controller already fired onPersist before invoking us
          // (see GameplayUI's quit-to-title path).
          queueMicrotask(() => {
            void ctx.scenes.switchTo(new TitleScene(), ctx);
          });
        },
        onPersist: (snapshot) => this.writeSave(snapshot),
        onDropItem: (kind) => this.dropItemToWorld(kind),
        onPickup: (kind, result, gold) => {
          if (result === 'full') return; // toast already shown by controller
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

    // Apply Dart's TLoD-canonical stat row for the current character level.
    // New games dev-force LV5 (HP 150 / atk 11 / def 12 / mat 11 / mdf 11)
    // so the Forest is playable on TLoD-tuned mobs — remove before ship.
    this.applyDartRow(fromThisZone);

    if (!this.saveData) this.seedNewGameLoadout();

    this.controller.ui.zoneTitle?.show(
      t('zones.forestOfSeles.name'),
      t('zones.forestOfSeles.objective'),
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
   *  current `Progression.level`. Same-zone resume keeps the saved HP
   *  (player might be damaged); cross-zone arrivals top up to full. */
  private applyDartRow(fromThisZone: boolean): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerId = controller.playerId;
    const prog = world.getComponent(playerId, 'Progression');
    const stats = world.getComponent(playerId, 'Stats');
    const hp = world.getComponent(playerId, 'Health');
    const level = prog?.level ?? 1;
    applyDartRow(stats, hp, level, fromThisZone);
    if (!fromThisZone && hp) hp.current = hp.max;
  }

  /** Dev loadout for fresh runs: force LV5 + canonical stats, prefill a
   *  pair of usable items + bind them to hotbar slots. Removed once the
   *  full progression loop ships. */
  private seedNewGameLoadout(): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const world = controller.world;
    const playerId = controller.playerId;
    const prog = world.getComponent(playerId, 'Progression');
    const stats = world.getComponent(playerId, 'Stats');
    const hp = world.getComponent(playerId, 'Health');
    if (prog) {
      prog.level = 5;
      prog.xp = xpThresholdForLevel(5);
      prog.xpToNext = xpThresholdForLevel(6);
    }
    applyDartRow(stats, hp, 5, false);
    if (hp) hp.current = hp.max;
    const inv = world.getComponent(playerId, 'Inventory');
    if (inv) {
      inv.items.healingPotion = 5;
      inv.items.burnOut = 3;
    }
    controller.hotbarSlots[1] = { kind: 'item', item: 'healingPotion' };
    controller.hotbarSlots[2] = { kind: 'item', item: 'burnOut' };
  }

  /** Translate Dart's per-level addition unlock schedule into engine-known
   *  kinds. Future additions (Volcano, Burning Rush, …) appear here once
   *  they ship in ADDITIONS. */
  private unlockedAdditions(level: number): ReadonlyArray<AdditionKind> {
    const out: AdditionKind[] = [];
    for (const [unlockLv, slug] of DART_ADDITION_UNLOCKS_BY_LEVEL) {
      if (level < unlockLv) continue;
      if (slug in ADDITIONS) out.push(slug as AdditionKind);
    }
    return out.length > 0 ? out : ['doubleSlash'];
  }

  /** Inventory-panel drop: spawn a pickable Item entity at the player's
   *  position. A 1.5 s grace prevents auto-pickup from immediately
   *  grabbing the item back. */
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

  /** Write the controller snapshot to localStorage, preserving cross-zone
   *  fog grids (Hellena's record must not be clobbered by Forest's save). */
  private writeSave(snap: GameplaySnapshot): void {
    const existing = SaveManager.load();
    const existingFog = existing?.fogByZone ?? {};
    const forestFog = this.controller?.fog?.exportRevealed();
    SaveManager.save({
      currentZoneId: 'forest',
      discoveredZones: existing?.discoveredZones ?? ['forest', 'hellena'],
      fogByZone: forestFog ? { ...existingFog, forest: forestFog } : existingFog,
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
