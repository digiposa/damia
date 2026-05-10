import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';

/** Right-edge padding (kept tight so the buttons hug the screen edge). */
const PADDING_RIGHT_PX = 12;
/** Bottom padding — lifts the action stack clear of the new hotbar strip
 *  (slot 38 px + 8 px padding ≈ 46 px) with a small breathing gap. */
const PADDING_BOTTOM_PX = 60;
const BTN_LARGE = 38;
const BTN_MEDIUM = 30;
/** Vertical gap between stacked buttons. */
const STACK_GAP = 12;

interface ButtonSpec {
  label: string;
  radius: number;
  /** Fired on pointerdown — fire-and-forget. We deliberately don't wait
   *  for pointerup because mobile browsers occasionally swallow it as a
   *  cancel, and for action buttons faster feedback feels better. */
  onTap: () => void;
  /** Optional state-driven tint. Polled every frame so the visual reflects
   *  the controller's truth without internal state to drift. */
  isActive?: () => boolean;
  /** Optional [0, 1] cooldown fraction (1 = just triggered, 0 = ready).
   *  Polled every frame to paint a sweeping radial dim over the button
   *  while the action is on cooldown. */
  cooldownFrac?: () => number;
}

/**
 * On-screen action buttons for touch devices. Vertical stack at bottom-
 * right: Attack (largest), Addition, Defend.
 *
 * Defend uses both `isActive` (red while the 3 s block is in progress)
 * and `cooldownFrac` (gray dim radial during the 10 s cooldown after).
 */
export class TouchActionButtons {
  readonly container: Container;
  private app: Application;
  private buttons: Array<{ spec: ButtonSpec; bg: Graphics; cd: Graphics }> = [];
  private cleanupFns: Array<() => void> = [];
  private tickerCb: (() => void) | null = null;

  constructor(
    app: Application,
    handlers: {
      onAttack: () => void;
      onAddition: () => void;
      onDefend: () => void;
      isDefending: () => boolean;
      defendCooldownFrac: () => number;
    },
  ) {
    this.app = app;
    this.container = new Container({ label: 'touch-action-buttons' });

    const specs: ButtonSpec[] = [
      { label: 'A', radius: BTN_LARGE, onTap: handlers.onAttack },
      { label: '*', radius: BTN_MEDIUM, onTap: handlers.onAddition },
      {
        label: 'D',
        radius: BTN_MEDIUM,
        onTap: handlers.onDefend,
        isActive: handlers.isDefending,
        cooldownFrac: handlers.defendCooldownFrac,
      },
    ];

    for (const spec of specs) {
      const built = this.makeButton(spec);
      this.buttons.push({ spec, bg: built.bg, cd: built.cd });
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

  private makeButton(spec: ButtonSpec): { container: Container; bg: Graphics; cd: Graphics } {
    const container = new Container({ label: `touch-btn-${spec.label}` });
    const bg = new Graphics()
      .circle(0, 0, spec.radius)
      .fill({ color: 0x1c2840, alpha: 0.85 })
      .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });
    const text = new Text({
      text: spec.label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: spec.radius,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    text.anchor.set(0.5);
    // Cooldown overlay — drawn ON TOP of the bg + label so the radial dim
    // visually sweeps across both. Re-painted in refreshOverlays().
    const cd = new Graphics();
    container.addChild(bg, text, cd);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    // Fire on pointerdown (fast feedback + survives a stray pointercancel
    // between down and up that would kill `pointertap`).
    const onDown = (e: FederatedPointerEvent): void => {
      e.stopPropagation();
      spec.onTap();
    };
    container.on('pointerdown', onDown);
    this.cleanupFns.push(() => container.off('pointerdown', onDown));

    return { container, bg, cd };
  }

  private layoutStack(): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    let cursorY = h - PADDING_BOTTOM_PX;
    for (let i = 0; i < this.buttons.length; i++) {
      const entry = this.buttons[i];
      const child = this.container.children[i];
      if (!entry || !child) continue;
      cursorY -= entry.spec.radius;
      child.position.set(w - PADDING_RIGHT_PX - entry.spec.radius, cursorY);
      cursorY -= entry.spec.radius + STACK_GAP;
    }
  }

  /** Per-frame refresh of `isActive` tint + `cooldownFrac` radial dim. */
  private refreshOverlays(): void {
    for (const { spec, bg, cd } of this.buttons) {
      const active = spec.isActive?.() ?? false;
      const colour = active ? 0xa08050 : 0x1c2840;
      bg.clear()
        .circle(0, 0, spec.radius)
        .fill({ color: colour, alpha: active ? 0.95 : 0.85 })
        .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });

      cd.clear();
      const frac = spec.cooldownFrac?.() ?? 0;
      if (frac > 0.001) {
        // Radial sweep: clockwise pie slice covering `frac × 360°` of the
        // disc. arc() goes from -90° (top) clockwise. Drawn in the same
        // dim grey we use for unrevealed fog so the visual is immediately
        // legible as "blocked".
        const start = -Math.PI / 2;
        const end = start + frac * Math.PI * 2;
        cd.moveTo(0, 0)
          .arc(0, 0, spec.radius, start, end)
          .lineTo(0, 0)
          .fill({ color: 0x000000, alpha: 0.55 });
      }
    }
  }
}
