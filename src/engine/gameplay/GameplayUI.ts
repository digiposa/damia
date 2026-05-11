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
  // Additions bar (desktop only)
  onAdditionsBarSelect: (kind: AdditionKind) => void;
}

export interface GameplayUIMounts {
  /** Required when `overrides.showMiniMap` is true. */
  fog?: FogOfWar | null;
  /** Path zones drawn on the minimap. */
  pathZones?: readonly TileMapPathZone[];
}

export class GameplayUI {
  readonly hud: Hud;
  readonly hotbar: Hotbar;
  readonly settings: SettingsPanel;
  readonly inventoryPanel: InventoryPanel;
  readonly toast: Toast;
  readonly additionsBar: AdditionsBar | null;
  readonly additionsPicker: AdditionsPicker | null;
  readonly minimap: MiniMap | null;
  readonly zoneTitle: ZoneTitle | null;
  readonly actionLog: ActionLog | null;
  readonly encounterIndicator: EncounterIndicator | null;
  readonly virtualJoystick: VirtualJoystick | null;
  readonly touchActionButtons: TouchActionButtons | null;
  readonly touchMenuButtons: TouchMenuButtons | null;

  readonly touch: boolean;

  constructor(
    app: Application,
    layers: Layers,
    config: SceneConfig,
    handlers: GameplayUIHandlers,
    mounts: GameplayUIMounts = {},
  ) {
    this.touch = isTouchDevice();
    const o = config.overrides ?? {};

    // Always-on UI.
    this.toast = new Toast(app, layers.ui);
    this.hud = new Hud(app);
    this.hotbar = new Hotbar(app);
    this.hotbar.setOnSlotTap(handlers.onHotbarSlotTap);
    this.settings = new SettingsPanel(app);
    this.settings.onAction(handlers.onSettingsAction);
    this.inventoryPanel = new InventoryPanel(app);
    this.inventoryPanel.setCallbacks(handlers.inventoryCallbacks);
    layers.ui.addChild(this.inventoryPanel.container);

    // Optional Story / world UI (config-flagged).
    this.minimap =
      o.showMiniMap && mounts.fog
        ? new MiniMap(app, { fog: mounts.fog, pathZones: mounts.pathZones ?? [] })
        : null;
    this.zoneTitle = o.showZoneTitle ? new ZoneTitle(app) : null;
    this.actionLog = o.showActionLog ? new ActionLog(app) : null;
    this.encounterIndicator = o.showEncounterIndicator ? new EncounterIndicator() : null;
    if (this.encounterIndicator) layers.fx.addChild(this.encounterIndicator.node);

    // Additions bar — desktop-only display. On touch we hide it but
    // keep the instance so the controller can still push setState; the
    // long-press picker handles the change-active affordance.
    this.additionsBar = o.showAdditionsBar !== false ? new AdditionsBar(app) : null;
    if (this.additionsBar) {
      this.additionsBar.setOnSelect(handlers.onAdditionsBarSelect);
      if (this.touch) this.additionsBar.container.visible = false;
      layers.ui.addChild(this.additionsBar.container);
    }

    layers.ui.addChild(this.hud.container, this.hotbar.container, this.settings.container);
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
      });
      layers.ui.addChild(this.touchActionButtons.container);

      this.touchMenuButtons = new TouchMenuButtons(app, {
        onInventory: handlers.onInventoryToggle,
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
  }

  /** True while a modal panel (Settings / Inventory) is owning input —
   *  the controller uses this to hard-pause the simulation. */
  isPaused(): boolean {
    return this.settings.isOpen || this.inventoryPanel.isOpen;
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
    this.toast.destroy();
    this.hotbar.destroy();
    this.hud.destroy();
    this.settings.destroy();
    this.inventoryPanel.destroy();
  }
}
