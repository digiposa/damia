import type { Application, FederatedPointerEvent } from 'pixi.js';
import { Container, Graphics, Sprite as PixiSprite, Text } from 'pixi.js';
import { ITEMS, type ItemKind } from '@data/items';
import { AssetManager } from '@services/AssetManager';
import { t } from '@services/I18nService';
import { Modal } from './Modal';
import { COLORS, MODAL, TEXT } from './theme';
import { mkCloseButton } from './layoutHelpers';
import { type HotbarSlot, HOTBAR_SLOT_COUNT } from './Hotbar';
import { paintAdditionSlot, paintItemSlot, paintSlotFrame } from './slot';
import { Tooltip } from './Tooltip';

const COLS = 8;
const ROWS = 4;
const SLOT_SIZE = 48;
const SLOT_GAP = 6;
const PADDING = 16;
const HEADER_HEIGHT = 36;
const HOTBAR_LABEL_HEIGHT = 24;
const HINT_HEIGHT = 22;
const PANEL_WIDTH = COLS * SLOT_SIZE + (COLS - 1) * SLOT_GAP + PADDING * 2;
const PANEL_HEIGHT =
  HEADER_HEIGHT +
  ROWS * SLOT_SIZE +
  (ROWS - 1) * SLOT_GAP +
  HOTBAR_LABEL_HEIGHT +
  SLOT_SIZE +
  HINT_HEIGHT +
  PADDING * 4;

export interface InventoryPanelState {
  /** Item count by kind. Insertion order is preserved (Object.keys). */
  items: Partial<Record<ItemKind, number>>;
  gold: number;
  hotbarSlots: ReadonlyArray<HotbarSlot>;
}

export interface InventoryPanelCallbacks {
  onBind: (kind: ItemKind, slotIdx: number) => void;
  onUse: (kind: ItemKind) => void;
  onDrop: (kind: ItemKind) => void;
}

/**
 * Modal inventory panel. Built on the shared Modal base for the
 * backdrop / open / close / raise-to-top boilerplate; internals keep
 * the absolute-positioned 8×4 grid + drag-drop + mini-hotbar layout
 * (the drag-bounds math is easier to reason about with explicit
 * pixel offsets than via flex). The panel itself is scale-to-fit on
 * narrow viewports — `applyPanelSize()` is overridden to keep that
 * behaviour instead of the default flex-width approach.
 *
 * Interactions:
 *  - Hover: tooltip with name + description + count.
 *  - Click on item slot: select (gold border).
 *  - Drag from inventory slot to a mini-hotbar slot: bind.
 *  - Right-click on item slot: use.
 *  - Top-right "×" or Esc / I: close.
 */
export class InventoryPanel extends Modal {
  private callbacks: InventoryPanelCallbacks | null = null;
  private state: InventoryPanelState = { items: {}, gold: 0, hotbarSlots: [] };
  private innerPanel: Container | null = null;
  private grid: Container | null = null;
  private hotbarMini: Container | null = null;
  private tooltip: Tooltip | null = null;
  private goldText: Text | null = null;
  private hintText: Text | null = null;
  private drag: { kind: ItemKind; ghost: Container } | null = null;
  private selectedKind: ItemKind | null = null;
  private readonly miniHotbarSlots: Container[] = [];

  constructor(app: Application) {
    super(app, 'inventory-panel');
    this.container.eventMode = 'static';
    this.container.on('pointerup', (e) => this.endDrag(e));
    this.container.on('pointerupoutside', (e) => this.endDrag(e));
    this.container.on('pointermove', (e) => this.moveDrag(e));
  }

  setCallbacks(cb: InventoryPanelCallbacks): void {
    this.callbacks = cb;
  }

  getSelectedKind(): ItemKind | null {
    return this.selectedKind;
  }

  /** Compat with old `open(state)` signature. The base Modal's open()
   *  is parameterless, so we override here to forward state through. */
  override open(state?: InventoryPanelState): void {
    if (state) this.state = state;
    super.open();
    if (state) this.setState(state);
  }

  protected override onClose(): void {
    this.cancelDrag();
    this.selectedKind = null;
    this.tooltip?.hide();
  }

  protected buildPanel(): Container {
    const panel = new Container({ label: 'inventory-card' });
    this.innerPanel = panel;

    const panelBg = new Graphics()
      .roundRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 8)
      .fill({ color: COLORS.cardBg, alpha: 0.95 })
      .stroke({ color: COLORS.border, width: 2, alpha: 0.85 });
    panel.addChild(panelBg);

    const titleText = new Text({
      text: t('inventory.title'),
      style: { ...TEXT.title, fill: COLORS.textCream, fontSize: 20 },
    });
    titleText.position.set(PADDING, PADDING);
    panel.addChild(titleText);

    this.goldText = new Text({
      text: '',
      style: {
        fill: COLORS.gold,
        fontSize: 16,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    this.goldText.anchor.set(1, 0);
    // Reserve space for the close button on the right.
    this.goldText.position.set(PANEL_WIDTH - PADDING - 36, PADDING + 2);
    panel.addChild(this.goldText);

    // Close button — top-right corner, matches the StatusPanel one.
    const close = mkCloseButton(() => this.close());
    close.position.set(PANEL_WIDTH - PADDING - 28, PADDING - 2);
    panel.addChild(close);

    // Inventory grid container — populated each setState.
    this.grid = new Container();
    this.grid.position.set(PADDING, PADDING + HEADER_HEIGHT);
    panel.addChild(this.grid);

    const gridHeightPx = ROWS * SLOT_SIZE + (ROWS - 1) * SLOT_GAP;
    const hotbarLabelY = PADDING + HEADER_HEIGHT + gridHeightPx + PADDING;
    const hotbarLabel = new Text({
      text: t('inventory.hotbarLabel'),
      style: { fill: COLORS.textSand, fontSize: 13, fontStyle: 'italic' },
    });
    hotbarLabel.position.set(PADDING, hotbarLabelY);
    panel.addChild(hotbarLabel);

    this.hotbarMini = new Container();
    this.hotbarMini.position.set(PADDING, hotbarLabelY + HOTBAR_LABEL_HEIGHT);
    panel.addChild(this.hotbarMini);

    const hintY = hotbarLabelY + HOTBAR_LABEL_HEIGHT + SLOT_SIZE + PADDING;
    this.hintText = new Text({
      text: t('inventory.hint'),
      style: { fill: 0x806040, fontSize: 11 },
    });
    this.hintText.position.set(PADDING, hintY);
    panel.addChild(this.hintText);

    // Tooltip — owned by the modal container (above panel, below drag ghost).
    this.tooltip = new Tooltip();
    this.container.addChild(this.tooltip.node);

    this.rebuildGrid();
    this.rebuildHotbarMini();
    return panel;
  }

  /** Override the default flex-sizing — this panel uses absolute
   *  positioning and scales uniformly to fit narrow viewports. */
  protected override applyPanelSize(): void {
    if (!this.innerPanel) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const scale = Math.min(1, (w - MODAL.margin) / PANEL_WIDTH, (h - MODAL.margin) / PANEL_HEIGHT);
    this.innerPanel.scale.set(scale);
    this.innerPanel.position.set((w - PANEL_WIDTH * scale) / 2, (h - PANEL_HEIGHT * scale) / 2);
  }

  setState(state: InventoryPanelState): void {
    this.state = state;
    if (this.goldText) this.goldText.text = `${state.gold} G`;
    this.rebuildGrid();
    this.rebuildHotbarMini();
  }

  private rebuildGrid(): void {
    if (!this.grid) return;
    this.grid.removeChildren().forEach((c) => c.destroy());

    const kinds = (Object.keys(this.state.items) as ItemKind[]).filter(
      (k) => (this.state.items[k] ?? 0) > 0,
    );

    for (let i = 0; i < COLS * ROWS; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * (SLOT_SIZE + SLOT_GAP);
      const y = row * (SLOT_SIZE + SLOT_GAP);

      const slot = new Container();
      slot.position.set(x, y);
      slot.eventMode = 'static';

      const kind = kinds[i] ?? null;
      const isSelected = kind !== null && kind === this.selectedKind;

      slot.addChild(paintSlotFrame(new Graphics(), SLOT_SIZE, isSelected));

      if (kind) {
        const content = new Container();
        slot.addChild(content);
        paintItemSlot(content, kind, {
          size: SLOT_SIZE,
          count: this.state.items[kind] ?? 0,
        });

        slot.cursor = 'grab';
        slot.on('pointerover', () => this.showTooltipAtSlot(slot, kind));
        slot.on('pointerout', () => this.tooltip?.hide());
        slot.on('pointerdown', (e) => this.onSlotPointerDown(e, kind));
        slot.on('rightclick', () => this.callbacks?.onUse(kind));
      } else {
        slot.cursor = 'default';
      }

      this.grid.addChild(slot);
    }
  }

  private rebuildHotbarMini(): void {
    if (!this.hotbarMini) return;
    this.hotbarMini.removeChildren().forEach((c) => c.destroy());
    this.miniHotbarSlots.length = 0;

    for (let i = 0; i < HOTBAR_SLOT_COUNT; i++) {
      const x = i * (SLOT_SIZE + SLOT_GAP);
      const slot = new Container();
      slot.position.set(x, 0);
      slot.eventMode = 'static';
      slot.cursor = 'pointer';

      slot.addChild(paintSlotFrame(new Graphics(), SLOT_SIZE, false));

      const label = new Text({
        text: String(i + 1),
        style: { fontSize: 11, fill: COLORS.border },
      });
      label.position.set(4, 3);
      slot.addChild(label);

      const binding = this.state.hotbarSlots[i] ?? null;
      if (binding) {
        const content = new Container();
        slot.addChild(content);
        if (binding.kind === 'addition') {
          paintAdditionSlot(content, binding.addition, { size: SLOT_SIZE });
        } else {
          paintItemSlot(content, binding.item, { size: SLOT_SIZE });
        }
      }

      this.hotbarMini.addChild(slot);
      this.miniHotbarSlots.push(slot);
    }
  }

  private showTooltipAtSlot(slotContainer: Container, kind: ItemKind): void {
    if (!this.tooltip) return;
    const def = ITEMS[kind];
    const count = this.state.items[kind] ?? 0;
    const name = t(def.nameKey);
    const desc = t(`items.${kind}.desc`);
    this.tooltip.setText(`${name} (×${count})\n${desc}`);
    const global = slotContainer.getGlobalPosition();
    const local = this.container.toLocal(global);
    this.tooltip.showAbove(local.x + SLOT_SIZE / 2, local.y, 4);
  }

  private onSlotPointerDown(e: FederatedPointerEvent, kind: ItemKind): void {
    if (e.button === 2) return; // right-click handled via rightclick listener
    this.selectedKind = kind;
    this.startDrag(kind, e);
    this.rebuildGrid();
  }

  private startDrag(kind: ItemKind, e: FederatedPointerEvent): void {
    this.cancelDrag();
    const def = ITEMS[kind];
    const tex = def.iconAlias ? AssetManager.getTexture(def.iconAlias) : null;
    const ghost = new Container();
    if (tex) {
      const icon = new PixiSprite(tex);
      const fit = Math.min((SLOT_SIZE - 8) / tex.width, (SLOT_SIZE - 8) / tex.height);
      icon.scale.set(fit);
      icon.anchor.set(0.5);
      ghost.addChild(icon);
    } else {
      ghost.addChild(new Graphics().circle(0, 0, 12).fill(def.sprite.color));
    }
    ghost.alpha = 0.85;
    ghost.eventMode = 'none';
    this.container.addChild(ghost);
    this.drag = { kind, ghost };
    this.moveDragTo(e.global.x, e.global.y);
  }

  private moveDrag(e: FederatedPointerEvent): void {
    if (!this.drag) return;
    this.moveDragTo(e.global.x, e.global.y);
  }

  private moveDragTo(globalX: number, globalY: number): void {
    if (!this.drag) return;
    const local = this.container.toLocal({ x: globalX, y: globalY });
    this.drag.ghost.position.set(local.x, local.y);
  }

  private endDrag(e: FederatedPointerEvent): void {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    this.container.removeChild(drag.ghost);
    drag.ghost.destroy();
    for (let i = 0; i < this.miniHotbarSlots.length; i++) {
      const slot = this.miniHotbarSlots[i]!;
      const bounds = slot.getBounds();
      if (
        e.global.x >= bounds.x &&
        e.global.x <= bounds.x + bounds.width &&
        e.global.y >= bounds.y &&
        e.global.y <= bounds.y + bounds.height
      ) {
        this.callbacks?.onBind(drag.kind, i);
        return;
      }
    }
  }

  private cancelDrag(): void {
    if (!this.drag) return;
    const drag = this.drag;
    this.drag = null;
    this.container.removeChild(drag.ghost);
    drag.ghost.destroy();
  }
}
