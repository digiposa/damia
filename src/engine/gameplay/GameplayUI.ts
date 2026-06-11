/**
 * Owns the full screen-space UI cluster for a gameplay scene. Every UI
 * widget that used to be re-instantiated per scene now lives here once,
 * with its handlers wired from one place. Adding a new menu button or
 * panel means touching this file only — no more wiring drift between
 * Forest / Hellena / Arena.
 *
 * The orchestrator never reads the ECS world directly. Per-frame state
 * (HP bars, hotbar slot contents, etc.) is pushed in by the controller
 * through the panels' own `setState` / setters; user input bubbles back
 * through the `GameplayUIHandlers` callbacks.
 */
import type { Application } from 'pixi.js';
import type { Layers } from '@rendering/Layers';
import { isTouchDevice } from '@services/Device';
import { isMuted, toggleMute } from '@services/AudioManager';

import { Hud } from '@ui/Hud';
import { Hotbar } from '@ui/Hotbar';
import { SettingsPanel, type SettingsPanelAction } from '@ui/SettingsPanel';
import { InventoryPanel, type InventoryPanelCallbacks } from '@ui/InventoryPanel';
import { AdditionsBar } from '@ui/AdditionsBar';
import { AdditionsPicker } from '@ui/AdditionsPicker';
import { MiniMap } from '@ui/MiniMap';
import { ZoneTitle } from '@ui/ZoneTitle';
import { ActionLog } from '@ui/ActionLog';
import { Toast } from '@ui/Toast';
import { VirtualJoystick } from '@ui/VirtualJoystick';
import { TouchActionButtons } from '@ui/TouchActionButtons';
import { TouchMenuButtons } from '@ui/TouchMenuButtons';
import { EncounterIndicator } from '@ui/EncounterIndicator';
import { CursorOverlay } from '@ui/CursorOverlay';
import { StatusPanel } from '@ui/StatusPanel';
import { CodexPanel } from '@ui/CodexPanel';
import type { Viewport } from 'pixi-viewport';
import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';

import type { SceneConfig } from './SceneConfig';
import type { AdditionKind } from '@data/balance';
import type { FogOfWar } from '@services/FogOfWar';
import type { TileMapPathZone } from '@rendering/TileMap';

export interface GameplayUIHandlers {
  // Settings panel
  onSettingsAction: (action: SettingsPanelAction) => void;
  // Inventory panel
  inventoryCallbacks: InventoryPanelCallbacks;
  /** Toggle the inventory open / close (the controller assembles the
   *  state snapshot before opening). Used by the touch menu button + a
   *  keyboard binding the controller may set up. */
  onInventoryToggle: () => void;
  // Hotbar
  onHotbarSlotTap: (slotIdx: number) => void;
  // Touch action buttons (joystick + attack + addition + defend)
  onTouchAttack: () => void;
  onTouchAddition: () => void;
  onTouchAdditionLongPress: () => void;
  getCurrentAddition: () => AdditionKind;
  getAdditionCooldownFrac: () => number;
  onTouchDefend: () => void;
  getIsDefending: () => boolean;
  getDefendCooldownFrac: () => number;
  // Dragoon transform — fourth touch button, SP-gated.
  onTouchDragoonTransform: () => void;
  getIsDragoonActive: () => boolean;
  getDragoonSpFrac: () => number;
  /** Whether the avatar has earned access to the Dragoon form
   *  (VISION §6.5). Drives DR button visibility + SP bar locked state. */
  getIsDragoonUnlocked: () => boolean;
  // Additions bar (desktop only)
  onAdditionsBarSelect: (kind: AdditionKind) => void;
}

export interface GameplayUIMounts {
  /** Required when `overrides.showMiniMap` is true. */
  fog?: FogOfWar | null;
  /** Path zones drawn on the minimap. */
  pathZones?: readonly TileMapPathZone[];
  /** Required when `overrides.showCursorOverlay` is true — the cursor
   *  overlay reads viewport scale to keep its sprite at constant px size
   *  regardless of camera zoom. */
  viewport?: Viewport;
  /** ECS world snapshot accessor. Required by read-only panels that
   *  render live component state (StatusPanel, future Magic /
   *  Additions / Equipment panels). */
  world: World<Components>;
  /** Returns the live player entity id, or null when no player is
   *  spawned yet. */
  getPlayerId: () => Entity | null;
}

export class GameplayUI {
  readonly hud: Hud;
  readonly hotbar: Hotbar;
  readonly settings: SettingsPanel;
  readonly codexPanel: CodexPanel;
  readonly inventoryPanel: InventoryPanel;
  readonly statusPanel: StatusPanel;
  readonly toast: Toast;
  readonly additionsBar: AdditionsBar | null;
  readonly additionsPicker: AdditionsPicker | null;
  readonly minimap: MiniMap | null;
  readonly zoneTitle: ZoneTitle | null;
  readonly actionLog: ActionLog | null;
  readonly encounterIndicator: EncounterIndicator | null;
  readonly cursorOverlay: CursorOverlay | null;
  readonly virtualJoystick: VirtualJoystick | null;
  readonly touchActionButtons: TouchActionButtons | null;
  readonly touchMenuButtons: TouchMenuButtons | null;

  readonly touch: boolean;

  constructor(
    app: Application,
    layers: Layers,
    config: SceneConfig,
    handlers: GameplayUIHandlers,
    mounts: GameplayUIMounts,
  ) {
    this.touch = isTouchDevice();
    const o = config.overrides ?? {};

    // Always-on UI.
    this.toast = new Toast(app, layers.ui);
    this.hud = new Hud(app);
    // Desktop Dragoon transform button (HUD-mounted). Reuses the same
    // handler as the touch button + the `T` keyboard shortcut, so the
    // controller's existing no-op-when-not-ready guards apply.
    this.hud.onDragoonTap(handlers.onTouchDragoonTransform);
    this.hotbar = new Hotbar(app);
    this.hotbar.setOnSlotTap(handlers.onHotbarSlotTap);
    this.settings = new SettingsPanel(app);
    // Intercept 'open-codex' here so the controller's onSettingsAction
    // only sees the existing Resume / Quit actions; everything else bubbles
    // through unchanged.
    this.codexPanel = new CodexPanel(app);
    this.settings.onAction((action) => {
      if (action === 'open-codex') {
        this.settings.close();
        this.codexPanel.open();
        return;
      }
      handlers.onSettingsAction(action);
    });
    this.inventoryPanel = new InventoryPanel(app);
    this.inventoryPanel.setCallbacks(handlers.inventoryCallbacks);
    layers.ui.addChild(this.inventoryPanel.container);
    // Status panel — read-only TLoD-style character sheet. The world
    // accessor lets it pull live ECS state without coupling GameplayUI
    // to the ECS directly (future Magic / Additions / Equipment panels
    // will share the same accessor).
    this.statusPanel = new StatusPanel(app, mounts.world, mounts.getPlayerId);
    layers.ui.addChild(this.statusPanel.container);

    // Optional Story / world UI (config-flagged).
    this.minimap =
      o.showMiniMap && mounts.fog
        ? new MiniMap(app, { fog: mounts.fog, pathZones: mounts.pathZones ?? [] })
        : null;
    this.zoneTitle = o.showZoneTitle ? new ZoneTitle(app) : null;
    // ActionLog is bottom-right anchored, which collides with the touch
    // action-button column on mobile portrait — skip it there. Toasts +
    // floating damage numbers still cover the kill / XP / drop feedback
    // surface on touch.
    this.actionLog = o.showActionLog && !this.touch ? new ActionLog(app) : null;
    this.encounterIndicator = o.showEncounterIndicator ? new EncounterIndicator() : null;
    if (this.encounterIndicator) layers.fx.addChild(this.encounterIndicator.node);

    // Custom sword cursor — desktop-only follower above every layer. The
    // controller updates `setMode` per frame to swap to the attack sprite
    // when hovering an enemy. Touch devices have no mouse cursor, so we
    // skip the mount entirely.
    this.cursorOverlay =
      o.showCursorOverlay && !this.touch && mounts.viewport
        ? new CursorOverlay(app, mounts.viewport)
        : null;
    if (this.cursorOverlay) app.stage.addChild(this.cursorOverlay.node);

    // Additions bar — desktop-only display. On touch we hide it but
    // keep the instance so the controller can still push setState; the
    // long-press picker handles the change-active affordance.
    this.additionsBar = o.showAdditionsBar !== false ? new AdditionsBar(app) : null;
    if (this.additionsBar) {
      this.additionsBar.setOnSelect(handlers.onAdditionsBarSelect);
      if (this.touch) this.additionsBar.container.visible = false;
      layers.ui.addChild(this.additionsBar.container);
    }

    layers.ui.addChild(this.hud.container, this.settings.container, this.codexPanel.container);
    if (this.minimap) layers.ui.addChild(this.minimap.container);
    if (this.zoneTitle) layers.ui.addChild(this.zoneTitle.container);
    if (this.actionLog) layers.ui.addChild(this.actionLog.container);

    // Touch cluster — joystick + bottom-right action buttons + top menu
    // buttons + additions picker. Only mounted on touch devices.
    if (this.touch) {
      this.virtualJoystick = new VirtualJoystick(app);
      layers.ui.addChild(this.virtualJoystick.container);

      this.touchActionButtons = new TouchActionButtons(app, {
        onAttack: handlers.onTouchAttack,
        onAddition: handlers.onTouchAddition,
        onAdditionLongPress: handlers.onTouchAdditionLongPress,
        currentAddition: handlers.getCurrentAddition,
        additionCooldownFrac: handlers.getAdditionCooldownFrac,
        onDefend: handlers.onTouchDefend,
        isDefending: handlers.getIsDefending,
        defendCooldownFrac: handlers.getDefendCooldownFrac,
        onDragoonTransform: handlers.onTouchDragoonTransform,
        isDragoonActive: handlers.getIsDragoonActive,
        dragoonSpFrac: handlers.getDragoonSpFrac,
        isDragoonUnlocked: handlers.getIsDragoonUnlocked,
      });
      layers.ui.addChild(this.touchActionButtons.container);

      this.touchMenuButtons = new TouchMenuButtons(app, {
        onInventory: handlers.onInventoryToggle,
        onStatus: () => {
          if (this.statusPanel.isOpen) this.statusPanel.close();
          else this.statusPanel.open();
        },
        onSettings: () => this.settings.toggle(),
        onMute: () => toggleMute(),
        isMuted: () => isMuted(),
      });
      layers.ui.addChild(this.touchMenuButtons.container);

      this.additionsPicker = new AdditionsPicker(app);
      layers.ui.addChild(this.additionsPicker.container);
    } else {
      this.virtualJoystick = null;
      this.touchActionButtons = null;
      this.touchMenuButtons = null;
      this.additionsPicker = null;
    }

    // Hotbar mounts LAST among non-modal UIs so its hover tooltip paints
    // above the joystick / action-button siblings. The slot frames don't
    // overlap with those widgets visually — only the floating tooltip
    // needed the higher z-order.
    layers.ui.addChild(this.hotbar.container);
  }

  /** True while a modal panel (Settings / Inventory / Codex / Status)
   *  is owning input — the controller uses this to hard-pause the
   *  simulation so opening any menu freezes the game world. */
  isPaused(): boolean {
    return (
      this.settings.isOpen ||
      this.inventoryPanel.isOpen ||
      this.statusPanel.isOpen ||
      this.codexPanel.isOpen
    );
  }

  destroy(): void {
    this.virtualJoystick?.destroy();
    this.touchActionButtons?.destroy();
    this.touchMenuButtons?.destroy();
    this.additionsPicker?.destroy();
    this.additionsBar?.destroy();
    this.minimap?.destroy();
    this.zoneTitle?.destroy();
    this.actionLog?.destroy();
    this.cursorOverlay?.destroy();
    this.encounterIndicator?.destroy();
    this.toast.destroy();
    this.hotbar.destroy();
    this.hud.destroy();
    this.settings.destroy();
    this.codexPanel.destroy();
    this.inventoryPanel.destroy();
    this.statusPanel.destroy();
  }
}
