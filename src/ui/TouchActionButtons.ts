import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';
import { ADDITIONS, type AdditionKind } from '@data/balance';
import { SafeArea } from '@services/SafeArea';

/** Right-edge padding (kept tight so the buttons hug the screen edge). */
const PADDING_RIGHT_PX = 12;
/** Bottom padding — lifts the action stack clear of the hotbar strip
 *  (slot 48 px + 24 px padding = 72 px) with a small breathing gap. */
const PADDING_BOTTOM_PX = 88;
const BTN_LARGE = 38;
const BTN_MEDIUM = 30;
/** Vertical gap between stacked buttons. */
const STACK_GAP = 12;
/** Long-press threshold for the addition button (opens the picker). */
const LONG_PRESS_MS = 380;

interface ButtonSpec {
  /** Initial label. May be overridden every frame via `getLabel`. */
  label: string;
  radius: number;
  /** Fired on a short tap (pointerdown for non-longpress buttons, or
   *  pointerup-before-threshold for buttons that opt into long-press). */
  onTap: () => void;
  /** Optional long-press handler. When set, the button uses a press-timer
   *  model: tap fires on pointerup if held < LONG_PRESS_MS, otherwise the
   *  long-press fires automatically once the threshold is crossed. */
  onLongPress?: () => void;
  /** Polled every frame; when defined we keep `label` in sync with the
   *  callback's return value so the addition button can reflect the
   *  currently-active addition. */
  getLabel?: () => string;
  /** Optional active-state tint (e.g. defend on). */
  isActive?: () => boolean;
  /** Optional [0, 1] cooldown sweep overlay. */
  cooldownFrac?: () => number;
  /** Optional visibility gate. False hides the button + disables its
   *  hit area, and `layoutStack` skips the slot entirely (no empty gap).
   *  Polled each frame so an in-run unlock surfaces the button live. */
  isVisible?: () => boolean;
}

/**
 * On-screen action buttons for touch devices. Vertical stack at bottom-
 * right: Attack (largest), Addition (medium, with long-press picker),
 * Defend (medium, with cooldown radial).
 *
 * The addition button is the only one that opts into long-press —
 * single tap fires the active addition like before, holding for ~400 ms
 * opens the picker so the player can switch active addition without a
 * permanent AdditionsBar eating top-screen real estate.
 */
export class TouchActionButtons {
  readonly container: Container;
  private app: Application;
  private buttons: Array<{
    spec: ButtonSpec;
    bg: Graphics;
    cd: Graphics;
    label: Text;
    lastLabel: string;
  }> = [];
  private cleanupFns: Array<() => void> = [];
  private tickerCb: (() => void) | null = null;

  constructor(
    app: Application,
    handlers: {
      onAttack: () => void;
      onAddition: () => void;
      onAdditionLongPress: () => void;
      currentAddition: () => AdditionKind;
      additionCooldownFrac: () => number;
      onDefend: () => void;
      isDefending: () => boolean;
      defendCooldownFrac: () => number;
      /** Tap-trigger for the Dragoon transformation. The handler
       *  is expected to no-op when the conditions aren't met (SP
       *  not full, already transformed, etc.) — the button stays
       *  active visually so the radial fill is always readable. */
      onDragoonTransform: () => void;
      /** True while the player is currently in Dragoon form. Drives
       *  the gold-active tint on the button. */
      isDragoonActive: () => boolean;
      /** 0..1 fill fraction for the SP gauge (cooldownFrac drains
       *  the inverse — so 0 SP → fully dim, full SP → fully bright). */
      dragoonSpFrac: () => number;
      /** Whether the avatar has earned access to the Dragoon form
       *  yet (VISION §6.5). False = the DR button is hidden + inert. */
      isDragoonUnlocked: () => boolean;
    },
  ) {
    this.app = app;
    this.container = new Container({ label: 'touch-action-buttons' });

    const additionLabel = (): string => initialsFor(handlers.currentAddition());

    const specs: ButtonSpec[] = [
      { label: 'A', radius: BTN_LARGE, onTap: handlers.onAttack },
      {
        label: additionLabel(),
        radius: BTN_MEDIUM,
        onTap: handlers.onAddition,
        onLongPress: handlers.onAdditionLongPress,
        getLabel: additionLabel,
        cooldownFrac: handlers.additionCooldownFrac,
      },
      {
        label: 'D',
        radius: BTN_MEDIUM,
        onTap: handlers.onDefend,
        isActive: handlers.isDefending,
        cooldownFrac: handlers.defendCooldownFrac,
      },
      {
        // Dragoon transform — bottom of the stack. The cooldown
        // radial inverts to a fill: empty (dark) when SP gauge is
        // 0, fully bright when SP is full. The handler decides
        // whether the tap actually triggers the form (or no-ops
        // when conditions aren't met). Hidden entirely while the
        // form is locked (VISION §6.5).
        label: 'DR',
        radius: BTN_MEDIUM,
        onTap: handlers.onDragoonTransform,
        isActive: handlers.isDragoonActive,
        cooldownFrac: () => 1 - handlers.dragoonSpFrac(),
        isVisible: handlers.isDragoonUnlocked,
      },
    ];

    for (const spec of specs) {
      const built = this.makeButton(spec);
      this.buttons.push({
        spec,
        bg: built.bg,
        cd: built.cd,
        label: built.label,
        lastLabel: spec.label,
      });
      this.container.addChild(built.container);
    }

    this.layoutStack();
    const onResize = (): void => this.layoutStack();
    app.renderer.on('resize', onResize);
    this.cleanupFns.push(() => app.renderer.off('resize', onResize));

    this.tickerCb = (): void => this.refreshOverlays();
    app.ticker.add(this.tickerCb);
  }

  destroy(): void {
    if (this.tickerCb) this.app.ticker.remove(this.tickerCb);
    this.tickerCb = null;
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.container.destroy({ children: true });
  }

  private makeButton(spec: ButtonSpec): {
    container: Container;
    bg: Graphics;
    cd: Graphics;
    label: Text;
  } {
    const container = new Container({ label: `touch-btn-${spec.label}` });
    const bg = new Graphics()
      .circle(0, 0, spec.radius)
      .fill({ color: 0x1c2840, alpha: 0.85 })
      .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });
    const label = new Text({
      text: spec.label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: spec.label.length <= 1 ? spec.radius : Math.round(spec.radius * 0.7),
        fill: 0xfaf6e8,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    label.anchor.set(0.5);
    const cd = new Graphics();
    container.addChild(bg, label, cd);

    container.eventMode = 'static';
    container.cursor = 'pointer';

    if (spec.onLongPress) {
      // Press-timer model so the addition button can distinguish a quick
      // tap (fire addition) from a long hold (open picker). Threshold is
      // ~380 ms — long enough to ignore a fumbled tap, short enough that
      // the picker feels responsive.
      let pressedAt = 0;
      let timerHandle: number | null = null;
      const cancelTimer = (): void => {
        if (timerHandle !== null) {
          window.clearTimeout(timerHandle);
          timerHandle = null;
        }
      };
      const onDown = (e: FederatedPointerEvent): void => {
        e.stopPropagation();
        pressedAt = performance.now();
        cancelTimer();
        timerHandle = window.setTimeout(() => {
          if (pressedAt > 0) {
            spec.onLongPress!();
            pressedAt = 0; // long-press consumed, ignore the matching pointerup
          }
          timerHandle = null;
        }, LONG_PRESS_MS);
      };
      const onUp = (e: FederatedPointerEvent): void => {
        cancelTimer();
        if (pressedAt === 0) return;
        const heldMs = performance.now() - pressedAt;
        pressedAt = 0;
        if (heldMs < LONG_PRESS_MS) {
          e.stopPropagation();
          spec.onTap();
        }
      };
      const onCancel = (): void => {
        cancelTimer();
        pressedAt = 0;
      };
      container.on('pointerdown', onDown);
      container.on('pointerup', onUp);
      container.on('pointerupoutside', onCancel);
      this.cleanupFns.push(
        () => container.off('pointerdown', onDown),
        () => container.off('pointerup', onUp),
        () => container.off('pointerupoutside', onCancel),
        cancelTimer,
      );
    } else {
      // Fire-on-pointerdown: faster feedback + survives the
      // pointercancel-between-down-and-up failure mode we hit on
      // Android. No long-press affordance needed for Attack / Defend.
      const onDown = (e: FederatedPointerEvent): void => {
        e.stopPropagation();
        spec.onTap();
      };
      container.on('pointerdown', onDown);
      this.cleanupFns.push(() => container.off('pointerdown', onDown));
    }

    return { container, bg, cd, label };
  }

  private layoutStack(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    // Safe-area insets lift the stack above the iPhone home indicator
    // and shift it inward away from a landscape-orientation cutout.
    const rightPad = PADDING_RIGHT_PX + SafeArea.right;
    let cursorY = h - PADDING_BOTTOM_PX - SafeArea.bottom;
    for (let i = 0; i < this.buttons.length; i++) {
      const entry = this.buttons[i];
      const child = this.container.children[i];
      if (!entry || !child) continue;
      // A button hidden via isVisible() reserves no slot — the stack
      // collapses around it so unlocked buttons sit flush against the
      // safe-area baseline.
      const visible = entry.spec.isVisible?.() ?? true;
      child.visible = visible;
      child.eventMode = visible ? 'static' : 'none';
      if (!visible) continue;
      cursorY -= entry.spec.radius;
      child.position.set(w - rightPad - entry.spec.radius, cursorY);
      cursorY -= entry.spec.radius + STACK_GAP;
    }
  }

  /** Per-frame refresh of active tint + cooldown radial dim + dynamic
   *  label (poll-based so the scene doesn't have to push state). */
  private refreshOverlays(): void {
    for (const entry of this.buttons) {
      const { spec, bg, cd, label } = entry;
      const active = spec.isActive?.() ?? false;
      const colour = active ? 0xa08050 : 0x1c2840;
      bg.clear()
        .circle(0, 0, spec.radius)
        .fill({ color: colour, alpha: active ? 0.95 : 0.85 })
        .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });

      if (spec.getLabel) {
        const next = spec.getLabel();
        if (next !== entry.lastLabel) {
          label.text = next;
          // Re-fit font size when the glyph count changes (e.g. "DS" → "VS"
          // is fine, but "DS" → "F" would otherwise look tiny).
          const newSize = next.length <= 1 ? spec.radius : Math.round(spec.radius * 0.7);
          if (label.style.fontSize !== newSize) {
            label.style.fontSize = newSize;
          }
          entry.lastLabel = next;
        }
      }

      cd.clear();
      const frac = spec.cooldownFrac?.() ?? 0;
      if (frac > 0.001) {
        const start = -Math.PI / 2;
        const end = start + frac * Math.PI * 2;
        cd.moveTo(0, 0)
          .arc(0, 0, spec.radius, start, end)
          .lineTo(0, 0)
          .fill({ color: 0x000000, alpha: 0.55 });
      }
    }
    // Re-flow each frame so a mid-run visibility change (e.g. picking
    // the dragoonUnlock upgrade reveals the DR button) takes effect
    // immediately. Cheap — 4 buttons, plain arithmetic.
    this.layoutStack();
  }
}

/** First letter of each word in the addition's name — same convention as
 *  the hotbar / picker slot painters so the visuals rhyme. */
function initialsFor(kind: AdditionKind): string {
  const name = ADDITIONS[kind]?.name ?? '';
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('');
}
