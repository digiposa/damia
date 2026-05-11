import type { Application, FederatedPointerEvent } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { ITEMS, type ItemKind } from '@data/items';
import { t } from '@services/I18nService';
import { paintAdditionSlot, paintItemSlot } from './slot';
import { Tooltip } from './Tooltip';

/** Visible hotbar slot count. Held at 6 for the mobile-portrait layout —
 *  fewer slots = larger taps = less crowding next to the joystick / action
 *  buttons. Save data still serialises this length, so a future bump back
 *  to 8 only needs the constant change + slot 6/7 keys re-bound. */
export const HOTBAR_SLOT_COUNT = 6;
/** Slot square size. Compact enough that 8 slots + gaps fit a 360 px-wide
 *  portrait screen with margin (8*38 + 7*4 = 332 px). */
const SLOT_SIZE = 38;
const SLOT_GAP = 4;
/** Sit flush against the bottom edge — joystick + action buttons get
 *  lifted above the hotbar (their own padding bumped to ~60 px) so they
 *  don't compete for the same row. */
const PADDING_BOTTOM = 8;

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
  /** True while the player is mid-Spell, mid-Addition, Defending, or
   *  dying — anything that makes `tryConsumeItem` reject silently. The
   *  hotbar paints a dim overlay over every item slot so the player
   *  sees the slot is busy instead of "I tapped and nothing happened". */
  itemsLocked?: boolean;
}

/** Brief tap-confirmation flash duration. The slot pulses for this long
 *  on every pointerdown so the user can tell whether the tap landed,
 *  regardless of whether the underlying action fired. */
const FLASH_MS = 160;

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
  /** Per-slot tap-confirmation flash overlay — drawn on top of the slot
   *  content for FLASH_MS after every pointerdown so the player sees the
   *  tap landed. */
  private readonly slotFlashes: Graphics[] = [];
  private readonly flashUntilMs: number[] = [];
  /** Per-slot lock overlay (dim wash) — painted while items are
   *  unavailable. Kept separate from the flash so they layer cleanly. */
  private readonly slotLocks: Graphics[] = [];
  /** Hover tooltip — single shared instance, hidden by default. */
  private readonly tooltip: Tooltip;
  /** Latest state passed to setState — read by hover handlers to format the tooltip. */
  private lastState: HotbarState | null = null;
  /** Tap callback — set by the scene so taps on a slot fire the same path
   *  as hitting the matching number key (1..8). Null by default so desktop
   *  / scenes that don't wire it stay click-inert. */
  private slotTapHandler: ((slotIdx: number) => void) | null = null;
  private tickerCb: (() => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'hotbar' });

    for (let i = 0; i < HOTBAR_SLOT_COUNT; i++) {
      const x = i * (SLOT_SIZE + SLOT_GAP);
      const slot = new Graphics()
        .roundRect(x, 0, SLOT_SIZE, SLOT_SIZE, 5)
        .fill({ color: 0x101010, alpha: 0.7 })
        .stroke({ width: 1, color: 0x806040, alpha: 0.8 });
      // Make the slot frame interactive for hover tooltips + taps.
      slot.eventMode = 'static';
      slot.cursor = 'pointer';
      slot.on('pointerover', () => this.showTooltipFor(i));
      slot.on('pointerout', () => this.hideTooltip());
      // Fire on pointerdown so the slot survives a `pointercancel` between
      // down and up (mobile browsers sometimes drop pointertap when they
      // decide a touch was a gesture). Same fire-and-forget pattern as
      // TouchActionButtons.
      slot.on('pointerdown', (e: FederatedPointerEvent) => {
        e.stopPropagation();
        // Pulse the slot regardless of whether the underlying action
        // fires — the flash is the tap-landed receipt.
        this.flashUntilMs[i] = performance.now() + FLASH_MS;
        this.slotTapHandler?.(i);
      });
      const label = new Text({
        text: String(i + 1),
        style: { fontFamily: 'system-ui, sans-serif', fontSize: 11, fill: 0xa08050 },
      });
      label.position.set(x + 4, 3);
      const content = new Container();
      content.position.set(x, 0);
      const lock = new Graphics();
      lock.position.set(x, 0);
      lock.visible = false;
      const flash = new Graphics();
      flash.position.set(x, 0);
      flash.visible = false;
      // Order: frame → content → lock dim → flash (flash on top of
      // everything so the tap pulse is always visible).
      this.container.addChild(slot, label, content, lock, flash);
      this.slotContents.push(content);
      this.slotLocks.push(lock);
      this.slotFlashes.push(flash);
      this.flashUntilMs.push(0);
    }

    // Tooltip — added LAST so it draws above the slot frames.
    this.tooltip = new Tooltip();
    this.container.addChild(this.tooltip.node);

    this.reposition();
    app.renderer.on('resize', () => this.reposition());

    // Per-frame tick to fade the tap flashes. Cheap — at most
    // HOTBAR_SLOT_COUNT Graphics redraws per frame.
    this.tickerCb = (): void => this.refreshFlashes();
    app.ticker.add(this.tickerCb);
  }

  private showTooltipFor(slotIdx: number): void {
    const slot = this.lastState?.slots[slotIdx] ?? null;
    if (!slot) {
      this.tooltip.hide();
      return;
    }
    this.tooltip.setText(this.formatTooltip(slot));
    const slotCenterX = slotIdx * (SLOT_SIZE + SLOT_GAP) + SLOT_SIZE / 2;
    this.tooltip.showAbove(slotCenterX, 0);
  }

  private hideTooltip(): void {
    this.tooltip.hide();
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
      const lock = this.slotLocks[i];
      if (!container || !lock) continue;
      if (!slot) {
        container.removeChildren().forEach((c) => c.destroy());
        lock.visible = false;
        continue;
      }
      if (slot.kind === 'addition') {
        paintAdditionSlot(container, slot.addition, {
          size: SLOT_SIZE,
          cooldownFrac: state.additionCooldowns[slot.addition] ?? 0,
        });
        // Additions paint their own per-cooldown dim — no whole-slot lock.
        lock.visible = false;
      } else {
        paintItemSlot(container, slot.item, {
          size: SLOT_SIZE,
          count: state.itemCounts[slot.item] ?? 0,
        });
        if (state.itemsLocked) {
          lock
            .clear()
            .roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 5)
            .fill({ color: 0x000000, alpha: 0.55 });
          lock.visible = true;
        } else {
          lock.visible = false;
        }
      }
    }
  }

  /** Wire the tap handler. Pass `null` to detach. The scene typically
   *  hands in its `activateHotbarSlot` directly so taps and the keyboard
   *  1..8 path share one resolver. */
  setOnSlotTap(handler: ((slotIdx: number) => void) | null): void {
    this.slotTapHandler = handler;
  }

  destroy(): void {
    if (this.tickerCb) this.app.ticker.remove(this.tickerCb);
    this.tickerCb = null;
    this.slotContents.length = 0;
    this.slotFlashes.length = 0;
    this.slotLocks.length = 0;
    this.flashUntilMs.length = 0;
    this.container.destroy({ children: true });
  }

  /** Fade the tap-pulse flashes each frame. Alpha decays linearly from 1
   *  at the tap moment to 0 at `flashUntilMs[i]`. */
  private refreshFlashes(): void {
    const now = performance.now();
    for (let i = 0; i < this.slotFlashes.length; i++) {
      const flash = this.slotFlashes[i];
      const until = this.flashUntilMs[i] ?? 0;
      if (!flash) continue;
      if (until <= 0 || now >= until) {
        if (flash.visible) flash.visible = false;
        continue;
      }
      const remaining = until - now;
      const alpha = Math.min(0.55, (remaining / FLASH_MS) * 0.55);
      flash.clear().roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 5).fill({ color: 0xfaf6e8, alpha });
      flash.visible = true;
    }
  }

  private reposition(): void {
    const totalWidth = HOTBAR_SLOT_COUNT * SLOT_SIZE + (HOTBAR_SLOT_COUNT - 1) * SLOT_GAP;
    this.container.position.set(
      (this.app.screen.width - totalWidth) / 2,
      this.app.screen.height - SLOT_SIZE - PADDING_BOTTOM,
    );
  }
}
