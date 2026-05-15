import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { Modal } from './Modal';
import { COLORS, MODAL } from './theme';
import { paintAdditionSlot } from './slot';

const SLOT_SIZE = 56;
const SLOT_GAP = 8;
const COLS = 4;
const LABEL_HEIGHT = 14;
const LABEL_GAP = 4;
const PADDING = 16;

/**
 * Modal picker for the player's unlocked additions. Pops on long-
 * press of the on-screen `*` button so we can drop the permanent
 * AdditionsBar from the mobile portrait HUD and recover that top
 * strip for the game world.
 *
 * Built on the shared Modal base for the dim backdrop + open / close /
 * raise-to-top boilerplate. The card itself is absolute-positioned +
 * scale-to-fit on narrow viewports (the slot grid uses pixel offsets
 * the long-press launcher knows how to position around).
 *
 * Layout: centred grid of slots, each painted with the addition's
 * initials and its full name underneath. Tap a slot to commit and
 * auto-close. Tap the dim backdrop to dismiss without changing the
 * active addition.
 */
export class AdditionsPicker extends Modal {
  private card: Container | null = null;
  private grid: Container | null = null;
  private onSelectCb: ((kind: AdditionKind) => void) | null = null;
  /** Stashed per-open arguments. The grid is created lazily in
   *  `buildPanel()` (= first call to `super.open()`), so `rebuildGrid`
   *  can't run from inside our `open()` override on the very first
   *  open. Defer the rebuild to `onOpen()` which fires after the panel
   *  is mounted. */
  private pendingUnlocked: ReadonlyArray<AdditionKind> | null = null;
  private pendingCurrent: AdditionKind | null = null;

  constructor(app: Application) {
    super(app, 'additions-picker');
    this.container.eventMode = 'static';
    // Tap on backdrop = dismiss. The Modal base's `dim` is the
    // backdrop graphic.
    this.dim.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.close();
    });
  }

  /** Override base API so the caller can pass unlocked / current / cb. */
  override open(
    unlocked?: ReadonlyArray<AdditionKind>,
    current?: AdditionKind,
    onSelect?: (k: AdditionKind) => void,
  ): void {
    if (onSelect) this.onSelectCb = onSelect;
    if (unlocked && current !== undefined) {
      this.pendingUnlocked = unlocked;
      this.pendingCurrent = current;
    }
    super.open();
  }

  protected override onOpen(): void {
    if (this.pendingUnlocked && this.pendingCurrent !== null) {
      this.rebuildGrid(this.pendingUnlocked, this.pendingCurrent);
      this.layout();
      this.pendingUnlocked = null;
      this.pendingCurrent = null;
    }
  }

  protected override onClose(): void {
    this.onSelectCb = null;
  }

  protected buildPanel(): Container {
    this.card = new Container({ label: 'additions-picker-card' });
    this.grid = new Container({ label: 'additions-picker-grid' });
    this.card.addChild(this.grid);
    return this.card;
  }

  /** Override the default flex sizing — picker is scale-to-fit. */
  protected override applyPanelSize(): void {
    this.layout();
  }

  private rebuildGrid(unlocked: ReadonlyArray<AdditionKind>, current: AdditionKind): void {
    if (!this.grid) return;
    this.grid.removeChildren().forEach((c) => c.destroy());
    for (let i = 0; i < unlocked.length; i++) {
      const kind = unlocked[i]!;
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const slot = new Container({ label: `picker-slot-${kind}` });
      const isCurrent = kind === current;
      const bg = new Graphics()
        .roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 6)
        .fill({ color: COLORS.cardBg, alpha: 0.95 })
        .stroke({
          width: 2,
          color: isCurrent ? COLORS.borderActive : COLORS.border,
          alpha: isCurrent ? 1 : 0.7,
        });
      slot.addChild(bg);
      const content = new Container();
      paintAdditionSlot(content, kind, { size: SLOT_SIZE });
      slot.addChild(content);

      const nameText = new Text({
        text: ADDITIONS[kind].name,
        style: { fontSize: 11, fill: COLORS.textSand, align: 'center' },
      });
      nameText.anchor.set(0.5, 0);
      nameText.position.set(SLOT_SIZE / 2, SLOT_SIZE + LABEL_GAP);
      slot.addChild(nameText);

      slot.position.set(
        col * (SLOT_SIZE + SLOT_GAP),
        row * (SLOT_SIZE + LABEL_HEIGHT + LABEL_GAP + SLOT_GAP),
      );
      slot.eventMode = 'static';
      slot.cursor = 'pointer';
      slot.on('pointerdown', (e: FederatedPointerEvent) => {
        e.stopPropagation();
        const cb = this.onSelectCb;
        this.close();
        cb?.(kind);
      });
      this.grid.addChild(slot);
    }
  }

  private layout(): void {
    if (!this.card || !this.grid) return;
    const childCount = this.grid.children.length;
    if (childCount === 0) return;
    const cols = Math.min(COLS, childCount);
    const rows = Math.ceil(childCount / COLS);
    const gridW = cols * SLOT_SIZE + (cols - 1) * SLOT_GAP;
    const gridH = rows * (SLOT_SIZE + LABEL_HEIGHT + LABEL_GAP) + (rows - 1) * SLOT_GAP - LABEL_GAP;
    const cardW = gridW + PADDING * 2;
    const cardH = gridH + PADDING * 2;

    // Wipe + repaint the card background ahead of the grid (children[0]).
    this.card.removeChildren().forEach((c) => {
      if (c !== this.grid) c.destroy();
    });
    const cardBg = new Graphics()
      .roundRect(0, 0, cardW, cardH, 10)
      .fill({ color: COLORS.panelBg, alpha: 0.95 })
      .stroke({ width: 2, color: COLORS.border, alpha: 0.85 });
    this.card.addChildAt(cardBg, 0);

    this.grid.position.set(PADDING, PADDING);

    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    const scale = Math.min(1, (sw - MODAL.margin) / cardW, (sh - MODAL.margin) / cardH);
    this.card.scale.set(scale);
    this.card.position.set((sw - cardW * scale) / 2, (sh - cardH * scale) / 2);
  }
}
