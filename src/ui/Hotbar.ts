import type { Application } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { ITEMS, type ItemKind } from '@data/items';

export const HOTBAR_SLOT_COUNT = 8;
const SLOT_SIZE = 48;
const SLOT_GAP = 6;
const PADDING_BOTTOM = 16;

export type HotbarSlot =
  | { kind: 'addition'; addition: AdditionKind }
  | { kind: 'item'; item: ItemKind }
  | null;

export interface HotbarState {
  /** Length-`HOTBAR_SLOT_COUNT` array. Use `null` for empty slots. */
  slots: ReadonlyArray<HotbarSlot>;
  /** AdditionKind → cooldown fraction in [0, 1]. 1 = just triggered, 0 = ready. */
  additionCooldowns: Partial<Record<AdditionKind, number>>;
  /** ItemKind → owned count (so the slot can show the badge). */
  itemCounts: Partial<Record<ItemKind, number>>;
}

/**
 * Centered bottom hotbar — 8 slots labeled 1..8. Pure renderer: takes a state
 * object each frame and repaints content (binding tag/icon, cooldown radial,
 * item count badge). The static layer (slot frames + key labels) is drawn once.
 *
 * Bindings live in the scene; this class doesn't own them so save/load can
 * persist them at the gameplay layer.
 */
export class Hotbar {
  readonly container: Container;
  private app: Application;
  /** Per-slot dynamic content container — cleared and repainted each frame. */
  private readonly slotContents: Container[] = [];

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'hotbar' });

    for (let i = 0; i < HOTBAR_SLOT_COUNT; i++) {
      const x = i * (SLOT_SIZE + SLOT_GAP);
      const slot = new Graphics()
        .roundRect(x, 0, SLOT_SIZE, SLOT_SIZE, 5)
        .fill({ color: 0x101010, alpha: 0.7 })
        .stroke({ width: 1, color: 0x806040, alpha: 0.8 });
      const label = new Text({
        text: String(i + 1),
        style: { fontFamily: 'system-ui, sans-serif', fontSize: 11, fill: 0xa08050 },
      });
      label.position.set(x + 4, 3);
      const content = new Container();
      content.position.set(x, 0);
      this.container.addChild(slot, label, content);
      this.slotContents.push(content);
    }

    this.reposition();
    app.renderer.on('resize', () => this.reposition());
  }

  /** Full repaint of dynamic content — call once per frame from the scene. */
  setState(state: HotbarState): void {
    for (let i = 0; i < HOTBAR_SLOT_COUNT; i++) {
      const slot = state.slots[i] ?? null;
      const container = this.slotContents[i];
      if (!container) continue;
      // Wipe previous frame's content. 8 slots × ~3 children → cheap.
      container.removeChildren().forEach((c) => c.destroy());
      if (!slot) continue;

      if (slot.kind === 'addition') {
        const tag = new Text({
          text: ADDITIONS[slot.addition].name
            .split(' ')
            .map((w) => w[0])
            .join(''),
          style: { fontFamily: 'system-ui, sans-serif', fontSize: 18, fill: 0xe8d8a0 },
        });
        tag.anchor.set(0.5);
        tag.position.set(SLOT_SIZE / 2, SLOT_SIZE / 2 + 2);
        container.addChild(tag);
        const frac = state.additionCooldowns[slot.addition] ?? 0;
        if (frac > 0) {
          container.addChild(
            new Graphics()
              .rect(0, SLOT_SIZE * (1 - frac), SLOT_SIZE, SLOT_SIZE * frac)
              .fill({ color: 0x000000, alpha: 0.55 }),
          );
        }
        continue;
      }

      // Item slot: small coloured circle (matches the world-space pickup look)
      // + count badge in the bottom-right corner.
      const def = ITEMS[slot.item];
      container.addChild(
        new Graphics()
          .circle(SLOT_SIZE / 2, SLOT_SIZE / 2 + 2, 12)
          .fill(def.sprite.color)
          .stroke({ color: 0x101010, width: 1, alpha: 0.8 }),
      );
      const count = state.itemCounts[slot.item] ?? 0;
      const countText = new Text({
        text: String(count),
        style: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          fill: count > 0 ? 0xffffff : 0x808080,
          fontWeight: 'bold',
          stroke: { color: 0x000000, width: 2 },
        },
      });
      countText.anchor.set(1, 1);
      countText.position.set(SLOT_SIZE - 3, SLOT_SIZE - 1);
      container.addChild(countText);
    }
  }

  destroy(): void {
    this.slotContents.length = 0;
    this.container.destroy({ children: true });
  }

  private reposition(): void {
    const totalWidth = HOTBAR_SLOT_COUNT * SLOT_SIZE + (HOTBAR_SLOT_COUNT - 1) * SLOT_GAP;
    this.container.position.set(
      (this.app.screen.width - totalWidth) / 2,
      this.app.screen.height - SLOT_SIZE - PADDING_BOTTOM,
    );
  }
}
