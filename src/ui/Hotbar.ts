import type { Application } from 'pixi.js';
import { Container, Graphics, Sprite as PixiSprite, Text } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { ITEMS, type ItemKind } from '@data/items';
import { AssetManager } from '@services/AssetManager';
import { t } from '@services/I18nService';

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
  /** Hover tooltip — single shared instance, hidden by default. */
  private readonly tooltip: Container;
  private readonly tooltipBg: Graphics;
  private readonly tooltipText: Text;
  /** Latest state passed to setState — read by hover handlers to format the tooltip. */
  private lastState: HotbarState | null = null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'hotbar' });

    for (let i = 0; i < HOTBAR_SLOT_COUNT; i++) {
      const x = i * (SLOT_SIZE + SLOT_GAP);
      const slot = new Graphics()
        .roundRect(x, 0, SLOT_SIZE, SLOT_SIZE, 5)
        .fill({ color: 0x101010, alpha: 0.7 })
        .stroke({ width: 1, color: 0x806040, alpha: 0.8 });
      // Make the slot frame interactive for hover tooltips.
      slot.eventMode = 'static';
      slot.cursor = 'help';
      slot.on('pointerover', () => this.showTooltipFor(i));
      slot.on('pointerout', () => this.hideTooltip());
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

    // Tooltip — added LAST so it draws above the slot frames.
    this.tooltip = new Container({ label: 'hotbar-tooltip' });
    this.tooltip.visible = false;
    this.tooltipBg = new Graphics();
    this.tooltipText = new Text({
      text: '',
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fill: 0xfaf6e8,
        align: 'center',
      },
    });
    this.tooltip.addChild(this.tooltipBg, this.tooltipText);
    this.container.addChild(this.tooltip);

    this.reposition();
    app.renderer.on('resize', () => this.reposition());
  }

  private showTooltipFor(slotIdx: number): void {
    const slot = this.lastState?.slots[slotIdx] ?? null;
    if (!slot) {
      this.hideTooltip();
      return;
    }
    const text = this.formatTooltip(slot);
    this.tooltipText.text = text;
    // Resize the bg to fit the text + padding (8 px each side).
    const padX = 8;
    const padY = 6;
    const w = this.tooltipText.width + padX * 2;
    const h = this.tooltipText.height + padY * 2;
    this.tooltipBg
      .clear()
      .roundRect(0, 0, w, h, 4)
      .fill({ color: 0x101010, alpha: 0.92 })
      .stroke({ color: 0xa08050, width: 1, alpha: 0.85 });
    this.tooltipText.position.set(padX, padY);
    // Center the tooltip horizontally above the hovered slot, with a small gap.
    const slotCenterX = slotIdx * (SLOT_SIZE + SLOT_GAP) + SLOT_SIZE / 2;
    this.tooltip.position.set(slotCenterX - w / 2, -h - 6);
    this.tooltip.visible = true;
  }

  private hideTooltip(): void {
    this.tooltip.visible = false;
  }

  private formatTooltip(slot: HotbarSlot): string {
    if (!slot) return '';
    if (slot.kind === 'addition') {
      const def = ADDITIONS[slot.addition];
      const name = t(`additions.${slot.addition}`) || def.name;
      const desc = t(`additions.${slot.addition}.desc`);
      return `${name}\n${desc}`;
    }
    const def = ITEMS[slot.item];
    const count = this.lastState?.itemCounts[slot.item] ?? 0;
    const name = t(def.nameKey);
    const desc = t(`items.${slot.item}.desc`);
    return `${name} (×${count})\n${desc}`;
  }

  /** Full repaint of dynamic content — call once per frame from the scene. */
  setState(state: HotbarState): void {
    this.lastState = state;
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

      // Item slot: textured icon if available (loaded asset), otherwise fall back
      // to the colored circle so a missing manifest entry still renders something.
      // Count badge is anchored bottom-right of the slot.
      const def = ITEMS[slot.item];
      const iconTex = def.iconAlias ? AssetManager.getTexture(def.iconAlias) : null;
      if (iconTex) {
        const icon = new PixiSprite(iconTex);
        const fit = Math.min((SLOT_SIZE - 8) / iconTex.width, (SLOT_SIZE - 8) / iconTex.height);
        icon.scale.set(fit);
        icon.anchor.set(0.5);
        icon.position.set(SLOT_SIZE / 2, SLOT_SIZE / 2 + 2);
        container.addChild(icon);
      } else {
        container.addChild(
          new Graphics()
            .circle(SLOT_SIZE / 2, SLOT_SIZE / 2 + 2, 12)
            .fill(def.sprite.color)
            .stroke({ color: 0x101010, width: 1, alpha: 0.8 }),
        );
      }
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
