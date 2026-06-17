import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import type { AssetTag } from '@services/AssetManager';
import { GameplayController } from '@/engine/gameplay/GameplayController';
import type { GameplaySnapshot, SceneConfig, SceneOverrides } from '@/engine/gameplay/SceneConfig';
import type { MapData } from './ForestOfSeles/MapLoader';
import type { AdditionKind } from '@data/balance';
import { DART, unlockedAdditions } from '@data/characters';
import { applyLevelStats } from '@gameplay/stats';
import { ITEMS, type ItemKind } from '@data/items';
import { spawnItem } from '@gameplay/entities/items';
import { SaveManager, type SaveDataV5 } from '@services/SaveManager';
import { t } from '@services/I18nService';
import { WorldMapScene } from '@scenes/WorldMapScene';
import { GameOverScene } from '@scenes/GameOverScene';
import { TitleScene } from '@scenes/TitleScene';

/** Story zones share a save record + fog grid keyed by this id. */
export type StoryZoneId = 'forest' | 'hellena';

/**
 * Shared base for the Story zone scenes (Forest of Seles, Hellena
 * Prison). Each zone is a thin wrapper around `GameplayController`; the
 * only things that genuinely differ between zones are data — the map,
 * the asset tags, a handful of override flags, the zone-title strings,
 * and whether a fresh game seeds a dev loadout. Everything else (the
 * config skeleton, the death / exit / quit / persist / pickup hooks, the
 * Dart stat-row application, the addition-unlock schedule, drop-to-world
 * and the save writer) is identical and lives here.
 *
 * A new story zone (Kazas, Black Castle, …) is then just: extend this,
 * fill in the five abstract members, optionally override `onFreshGame`.
 */
export abstract class StorySceneBase implements Scene {
  protected controller: GameplayController | null = null;

  constructor(protected readonly saveData: SaveDataV5 | null = null) {}

  // --- Subclass contract ------------------------------------------------
  /** Zone id — keys the save record, the fog grid, and the spawn-resume
   *  check. Also used as the scene `name`. */
  protected abstract readonly zoneId: StoryZoneId;
  abstract readonly requiredTags: readonly AssetTag[];
  protected abstract getMap(): MapData;
  /** Zone-specific overrides merged over the common story defaults
   *  (encounters, music, encounter indicator…). */
  protected abstract zoneOverrides(): SceneOverrides;
  /** Resolved i18n strings for the zone-title pop-in. */
  protected abstract zoneTitle(): { name: string; objective: string };
  /** Fresh-game (no save) setup hook — e.g. seed a dev loadout. No-op by
   *  default; zones that need it override. */
  protected onFreshGame(): void {}

  get name(): string {
    return this.zoneId;
  }

  // --- Scene lifecycle --------------------------------------------------
  enter(ctx: GameContext): void {
    const fromThisZone = this.saveData?.currentZoneId === this.zoneId;
    const spawnOverride =
      fromThisZone && this.saveData
        ? { gx: this.saveData.player.gx, gy: this.saveData.player.gy }
        : undefined;

    const config: SceneConfig = {
      mode: 'story',
      map: this.getMap(),
      saveData: this.saveData,
      overrides: {
        fogSaveZoneId: this.zoneId,
        showZoneTitle: true,
        showMiniMap: true,
        showActionLog: true,
        showAdditionsBar: true,
        showCursorOverlay: true,
        ...this.zoneOverrides(),
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
            // fires onPersist again on scene switch — idempotent.
            this.controller?.persist();
            queueMicrotask(() => {
              void ctx.scenes.switchTo(new WorldMapScene(SaveManager.load()), ctx);
            });
          } else if (exit.kind === 'blocked') {
            this.controller?.ui.toast.show(t(exit.messageKey));
          }
        },
        onQuit: () => {
          // The controller already fired onPersist before invoking us.
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
    this.applyDartRow(fromThisZone);

    if (!this.saveData) this.onFreshGame();

    const title = this.zoneTitle();
    this.controller.ui.zoneTitle?.show(title.name, title.objective);
  }

  exit(): void {
    this.controller?.destroy();
    this.controller = null;
  }

  update(dt: number): void {
    this.controller?.update(dt);
  }

  // --- Shared helpers ---------------------------------------------------
  /** Sync Dart's `Stats` + `Health.max` to the canonical row for his
   *  current `Progression.level`. Same-zone resume keeps the saved HP
   *  (player might be damaged); cross-zone arrivals top up to full.
   *  `applyLevelStats` re-derives the row WITHOUT stripping equipment
   *  bonuses (Broad Sword AT+2, etc.). */
  protected applyDartRow(fromThisZone: boolean): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const { world, playerId } = controller;
    const prog = world.getComponent(playerId, 'Progression');
    const level = prog?.level ?? 1;
    applyLevelStats(world, playerId, level, { fullHeal: !fromThisZone });
  }

  /** Dart's unlocked additions at `level`, master gating driven by the
   *  live `Progression.additionUses` counter. Falls back to Double Slash
   *  so the AdditionsBar always has at least one slug. */
  protected unlockedAdditions(level: number): ReadonlyArray<AdditionKind> {
    const controller = this.controller;
    const prog =
      controller && controller.playerId !== null
        ? controller.world.getComponent(controller.playerId, 'Progression')
        : undefined;
    const out = unlockedAdditions(DART.archetype, level, prog?.additionUses);
    return out.length > 0 ? out : ['doubleSlash'];
  }

  /** Inventory-panel drop: spawn a pickable Item entity at the player's
   *  position. A 1.5 s grace prevents auto-pickup from grabbing it back. */
  protected dropItemToWorld(kind: ItemKind): void {
    const controller = this.controller;
    if (!controller || controller.playerId === null) return;
    const { world, playerId } = controller;
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

  /** Write the controller snapshot to localStorage under this zone's key,
   *  preserving the OTHER zones' fog grids (a Forest ↔ Hellena trip must
   *  not wipe the player's prior exploration). */
  private writeSave(snap: GameplaySnapshot): void {
    const existing = SaveManager.load();
    const existingFog = existing?.fogByZone ?? {};
    const zoneFog = this.controller?.fog?.exportRevealed();
    SaveManager.save({
      currentZoneId: this.zoneId,
      discoveredZones: existing?.discoveredZones ?? ['forest', 'hellena'],
      fogByZone: zoneFog ? { ...existingFog, [this.zoneId]: zoneFog } : existingFog,
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
        additionUses: { ...snap.progressionAdditionUses },
      },
      activeAddition: snap.activeAddition,
    });
  }
}
