import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { paintAdditionSlot } from './slot';

const SLOT_SIZE = 56;
const SLOT_GAP = 8;
const COLS = 4;
const LABEL_HEIGHT = 14;
const LABEL_GAP = 4;
const PADDING = 16;

/**
 * Modal picker for the player's unlocked additions. Pops on long-press of
 * the on-screen `*` button so we can drop the permanent AdditionsBar
 * from the mobile portrait HUD and recover that top strip for the game
 * world.
 *
 * Layout: centred grid of slots, each painted with the addition's
 * initials (same painter as Hotbar / AdditionsBar) and its full name
 * underneath. Tap a slot to commit and auto-close. Tap the dim
 * backdrop to dismiss without changing the active addition.
 */
export class AdditionsPicker {
  readonly container: Container;
  isOpen = false;
  private readonly app: Application;
  private readonly dim: Graphics;
  private readonly card: Container;
  private readonly grid: Container;
  private onSelectCb: ((kind: AdditionKind) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'additions-picker' });
    this.container.visible = false;
    this.container.eventMode = 'static';

    this.dim = new Graphics();
    this.dim.eventMode = 'static';
    this.dim.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      this.close();
    });
    this.container.addChild(this.dim);

    this.card = new Container({ label: 'additions-picker-card' });
    this.container.addChild(this.card);

    this.grid = new Container({ label: 'additions-picker-grid' });
    this.card.addChild(this.grid);

    this.paintDim();
    app.renderer.on('resize', () => this.paintDim());
  }

  open(
    unlocked: ReadonlyArray<AdditionKind>,
    current: AdditionKind,
    onSelect: (k: AdditionKind) => void,
  ): void {
    this.onSelectCb = onSelect;
    this.rebuildGrid(unlocked, current);
    this.layout();
    this.isOpen = true;
    this.container.visible = true;
  }

  close(): void {
    this.isOpen = false;
    this.container.visible = false;
    this.onSelectCb = null;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  private paintDim(): void {
    this.dim
      .clear()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: 0x000000, alpha: 0.65 });
  }

  private rebuildGrid(unlocked: ReadonlyArray<AdditionKind>, current: AdditionKind): void {
    this.grid.removeChildren().forEach((c) => c.destroy());
    for (let i = 0; i < unlocked.length; i++) {
      const kind = unlocked[i]!;
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const slot = new Container({ label: `picker-slot-${kind}` });
      const isCurrent = kind === current;
      const bg = new Graphics()
        .roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 6)
        .fill({ color: 0x101010, alpha: 0.95 })
        .stroke({
          width: 2,
          color: isCurrent ? 0xeec040 : 0xa08050,
          alpha: isCurrent ? 1 : 0.7,
        });
      slot.addChild(bg);
      const content = new Container();
      paintAdditionSlot(content, kind, { size: SLOT_SIZE });
      slot.addChild(content);

      const nameText = new Text({
        text: ADDITIONS[kind].name,
        style: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: 11,
          fill: 0xc8b58a,
          align: 'center',
        },
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
    const childCount = this.grid.children.length;
    if (childCount === 0) return;
    const cols = Math.min(COLS, childCount);
    const rows = Math.ceil(childCount / COLS);
    const gridW = cols * SLOT_SIZE + (cols - 1) * SLOT_GAP;
    const gridH = rows * (SLOT_SIZE + LABEL_HEIGHT + LABEL_GAP) + (rows - 1) * SLOT_GAP - LABEL_GAP;
    const cardW = gridW + PADDING * 2;
    const cardH = gridH + PADDING * 2;

    // Card background
    this.card.removeChildren().forEach((c) => {
      if (c !== this.grid) c.destroy();
    });
    const cardBg = new Graphics()
      .roundRect(0, 0, cardW, cardH, 10)
      .fill({ color: 0x1c2030, alpha: 0.95 })
      .stroke({ width: 2, color: 0xa08050, alpha: 0.85 });
    this.card.addChildAt(cardBg, 0);

    this.grid.position.set(PADDING, PADDING);

    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    // Fit card inside the screen on smaller portrait devices.
    const scale = Math.min(1, (sw - 24) / cardW, (sh - 32) / cardH);
    this.card.scale.set(scale);
    this.card.position.set((sw - cardW * scale) / 2, (sh - cardH * scale) / 2);
  }
}
