/**
 * Per-scene configuration consumed by `GameplayController`. Each gameplay
 * scene boils down to a `SceneConfig` object plus a thin wrapper that
 * forwards lifecycle hooks (`enter` / `exit` / `update`) to the controller.
 *
 * Splitting the contract this way keeps the controller agnostic to
 * specifics ("Forest", "Survival", future zones) — they only differ in
 * data + a handful of hooks. New zones / modes drop in by writing a new
 * config; the controller's pipeline stays untouched.
 */
import type { Hud } from '@ui/Hud';
import type { Hotbar, HotbarSlot } from '@ui/Hotbar';
import type { GameMode } from '@data/mode';
import type { MapData } from '@scenes/ForestOfSeles/MapLoader';
import type { AssetAlias } from '@services/AssetManager';
import type { MusicAlias } from '@services/AudioManager';
import type { ItemKind } from '@data/items';
import type { AdditionKind, MobKind } from '@data/balance';
import type { CharacterDef } from '@data/characters';
import type { Components, Exit, Interactable } from '@gameplay/components';
import type { Entity, World } from '@core/ecs';
import type { GameContext } from '@/Game';
import type { EncounterZoneId } from '@data/encounters';
import type { SaveDataV5 } from '@services/SaveManager';

/** Sane defaults flipped via `MODE_TUNING`. Individual fields can still
 *  be overridden per scene if a zone wants to deviate. */
export interface SceneOverrides {
  /** pixi-viewport zoom applied at scene enter. Defaults from `MODE_TUNING`. */
  cameraZoom?: number;
  /** Whether the user can pan / wheel-zoom the camera. Story wild zones
   *  with FoV force this off so the player can't drift out of the lit
   *  area; survival forces it off to keep the camera strictly player-
   *  locked. */
  enablePan?: boolean;
  /** Mount a per-tile Fog-of-War overlay + radial VisionHalo. Defaults
   *  to `map.fov === true`. */
  enableFogOfWar?: boolean;
  /** Spawn random encounters as the player walks. Survival doesn't use
   *  this (wave spawner takes over later). */
  enableEncounters?: boolean;
  /** Zone id passed to the EncounterSystem so the mob roll table is
   *  scoped correctly. Required when `enableEncounters` is true. */
  encounterZoneId?: EncounterZoneId;
  /** Save key under `fogByZone` — kept separate from `encounterZoneId`
   *  because Hellena has a fog grid but no random encounters. */
  fogSaveZoneId?: 'forest' | 'hellena';
  /** Show the centred zone-title pop-in for ~4 s on enter. */
  showZoneTitle?: boolean;
  /** Top-right iso diamond minimap. */
  showMiniMap?: boolean;
  /** Right-side scrolling combat / pickup log. */
  showActionLog?: boolean;
  /** Permanent additions bar at the top of the screen (desktop story).
   *  On touch the bar is auto-hidden in favour of the long-press picker. */
  showAdditionsBar?: boolean;
  /** Encounter meter indicator pill in the FX layer. */
  showEncounterIndicator?: boolean;
  /** Animated sword cursor follower at app-stage level. Skipped on touch
   *  (no mouse). Story-only knob — Survival keeps the native cursor. */
  showCursorOverlay?: boolean;
  /** Music to start on enter. */
  musicAlias?: MusicAlias;
  /** Asset alias of a pre-painted iso backdrop. When set, the scene
   *  renders that single texture instead of compositing per-tile
   *  ground / path graphics (`TileMap` is bypassed). The grid /
   *  collision / pathfinder / entities still drive off `map.json`
   *  so swapping back to tiles is a one-line config flip — leave
   *  this undefined to use the regular tiled renderer. Targeted at
   *  scenes where a coherent painted scene (AI-gen or hand) reads
   *  better than seamless tiles — typically the Survival arena. */
  prerenderedMapAsset?: AssetAlias;
  /** Override the player spawn (defaults to `map.spawn`). */
  spawnOverride?: { gx: number; gy: number };
  /** Spawn the player with the Dragoon form already unlocked. Defaults
   *  to false (Story narrative + Survival `dragoonUnlock` upgrade gate
   *  this normally). Currently used by the Arena as a dev-loadout cheat
   *  so transforms are testable from frame 1. */
  dragoonStartUnlocked?: boolean;
  /** When false, mob kills no longer write to the player's `Progression`
   *  component or trigger the Dart-row level-up heal. Survival flips this
   *  off because it owns a separate per-run XP curve (in `RunState`) and
   *  Story-style level-ups would mid-run inflate HP / stats on top of it.
   *  Defaults to true (Story behaviour preserved). */
  awardPlayerXp?: boolean;
}

/** Optional callbacks the controller invokes when scene-specific
 *  behaviour matters. Anything missing falls through to a no-op or a
 *  sensible default. */
export interface SceneHooks {
  /** Player Health hit zero. Routing (GameOver, RunSummary…) belongs to
   *  the scene because it knows which mode + meta to pass along. */
  onPlayerDeath?: (ctx: GameContext) => void;
  /** Player stepped on an exit trigger (story zone transitions). */
  onZoneExit?: (ctx: GameContext, exit: Exit) => void;
  /** Player overlapped an Interactable trigger. */
  onInteract?: (interactable: Interactable) => void;
  /** Called periodically + on scene exit so story scenes can write the
   *  save file. Survival no-ops. */
  onPersist?: (snapshot: GameplaySnapshot) => void;
  /** User picked "Quit to title" in the Settings panel. The scene
   *  decides what to do (route to TitleScene, persist save first, etc.). */
  onQuit?: (ctx: GameContext) => void;
  /** Called every frame after the standard HUD refresh. Lets survival
   *  inject its timer / kill counter overlay without forking the HUD. */
  onTickHUD?: (hud: Hud, ctx: GameContext) => void;
  /** Called every frame after the standard hotbar repaint — lets the
   *  scene inject mode-specific badges or overlays if needed. */
  onTickHotbar?: (hotbar: Hotbar, world: World<Components>, playerId: Entity) => void;
  /** Mob pickup landed in the player inventory. */
  onPickup?: (kind: ItemKind, result: 'ok' | 'full' | 'gold', gold?: number) => void;
  /** A mob died. Fired exactly once per mob (Survival counts kills via
   *  this hook). The DeathSystem already handles XP / loot / death sfx
   *  internally — the hook is purely a notification channel. */
  onMobDeath?: (kind: MobKind) => void;
  /** Player chose "Drop" in the inventory panel. Story scenes spawn a
   *  pickable Item entity on the ground; Survival no-ops so the test
   *  loadout can't be wasted. */
  onDropItem?: (kind: ItemKind) => void;
  /** Returns the additions the player has unlocked at the given character
   *  level. Drives the AdditionsBar repaint and the touch picker. Defaults
   *  to `[active]` when omitted. */
  unlockedAdditions?: (level: number) => ReadonlyArray<AdditionKind>;
  /** Player crossed an XP threshold. Fires AFTER the Dart row + full
   *  heal have been applied, once per level gained (twice in one tick
   *  if a single XP award crossed two thresholds). Survival hooks here
   *  to re-apply accumulated run upgrades and pop the LevelUpChoiceModal;
   *  Story scenes ignore it for now. */
  onPlayerLevelUp?: (level: number) => void;
}

/** Snapshot of the live gameplay state. Passed to `onPersist` so the
 *  story scenes can build a save record without poking the controller's
 *  internals directly. */
export interface GameplaySnapshot {
  readonly playerHp: number;
  readonly playerMaxHp: number;
  readonly playerGx: number;
  readonly playerGy: number;
  readonly inventory: Readonly<Partial<Record<ItemKind, number>>>;
  readonly gold: number;
  readonly hotbarSlots: ReadonlyArray<HotbarSlot>;
  readonly progressionLevel: number;
  readonly progressionXp: number;
  readonly progressionXpToNext: number;
  /** Per-addition lifetime trigger counter (drives the Lv1..5 mastery
   *  curve). Snapshot is a shallow clone so save sites can't mutate
   *  the live ECS component. */
  readonly progressionAdditionUses: Readonly<Partial<Record<AdditionKind, number>>>;
  readonly activeAddition: AdditionKind;
}

/** Top-level config the scene hands to `new GameplayController(ctx, config)`. */
export interface SceneConfig {
  mode: GameMode;
  map: MapData;
  /** Playable character to spawn. Defaults to Dart when omitted —
   *  Story zones lean on the default; Survival's future character
   *  selector will pass an explicit pick here. */
  character?: CharacterDef;
  /** Save record to restore from (Story re-entry). Null for fresh runs
   *  and for Survival. */
  saveData?: SaveDataV5 | null;
  /** Per-scene knobs that fine-tune the engine defaults. */
  overrides?: SceneOverrides;
  hooks?: SceneHooks;
  /** Items pre-stocked in the player inventory at spawn — useful for
   *  Survival's dev-test loadout and future "starting kit" features. */
  prefilledInventory?: Partial<Record<ItemKind, number>>;
  /** Hotbar bindings applied right after spawn (only when not loading
   *  from save). */
  prefilledHotbar?: ReadonlyArray<HotbarSlot>;
}
