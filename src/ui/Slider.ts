import type { Application, FederatedPointerEvent } from 'pixi.js';
import { Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { COLORS } from './theme';

/**
 * Reusable horizontal drag-slider. Track + filled portion + draggable
 * handle, with click-to-jump on the track and stage-level pointermove
 * so drags don't break when the finger leaves the bar (same drag
 * pattern as VirtualJoystick).
 *
 * Integrates into a flex row via the returned `LayoutContainer` (sized
 * by `width` / `height`); the visuals are Graphics positioned inside
 * that fixed box so Yoga measurement stays stable. Step quantisation
 * snaps values to clean increments (the default `step: 0.05` keeps the
 * combat-speed slider on 5% notches).
 */
export interface SliderOptions {
  /** Total width of the slider's interactive box, in CSS px. */
  width: number;
  /** Total height of the slider's interactive box. Sets the touch
   *  hit-zone vertically; the painted track sits in the middle. */
  height: number;
  min: number;
  max: number;
  /** Quantisation step (defaults to a continuous slider when omitted —
   *  technically rounded to FP precision but visually smooth). */
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

const TRACK_HEIGHT = 4;
const HANDLE_RADIUS = 9;

export class Slider {
  readonly container: LayoutContainer;
  private opts: SliderOptions;
  private trackGfx: Graphics;
  private fillGfx: Graphics;
  private handleGfx: Graphics;
  private currentValue: number;
  private dragging = false;
  private activePointerId: number | null = null;
  private cleanupFns: Array<() => void> = [];

  constructor(app: Application, opts: SliderOptions) {
    this.opts = opts;
    this.currentValue = this.clampAndStep(opts.value);

    this.container = new LayoutContainer({
      label: 'slider',
      layout: { width: opts.width, height: opts.height, isLeaf: true },
    });
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    const midY = opts.height / 2;
    const trackX = HANDLE_RADIUS;
    const trackW = opts.width - HANDLE_RADIUS * 2;

    this.trackGfx = new Graphics()
      .roundRect(trackX, midY - TRACK_HEIGHT / 2, trackW, TRACK_HEIGHT, 2)
      .fill({ color: COLORS.subPanelBg })
      .stroke({ color: COLORS.border, width: 1, alpha: 0.6 });
    this.fillGfx = new Graphics();
    this.handleGfx = new Graphics();
    this.container.addChild(this.trackGfx, this.fillGfx, this.handleGfx);

    this.repaint();

    const onDown = (e: FederatedPointerEvent): void => {
      if (this.activePointerId !== null) return;
      this.activePointerId = e.pointerId;
      this.dragging = true;
      this.handleGfx.tint = COLORS.borderActive;
      this.updateFromPointer(e);
    };
    const onMove = (e: FederatedPointerEvent): void => {
      if (!this.dragging || this.activePointerId !== e.pointerId) return;
      this.updateFromPointer(e);
    };
    const onUp = (e: FederatedPointerEvent): void => {
      if (this.activePointerId !== e.pointerId) return;
      this.activePointerId = null;
      this.dragging = false;
      this.handleGfx.tint = 0xffffff;
    };

    // Down on the slider's own box (click-to-jump + drag start); move
    // and up on the stage so the drag survives the finger leaving the
    // track horizontally or vertically.
    this.container.on('pointerdown', onDown);
    app.stage.eventMode = 'static';
    app.stage.on('pointermove', onMove);
    app.stage.on('pointerup', onUp);
    app.stage.on('pointerupoutside', onUp);
    this.cleanupFns.push(
      () => this.container.off('pointerdown', onDown),
      () => app.stage.off('pointermove', onMove),
      () => app.stage.off('pointerup', onUp),
      () => app.stage.off('pointerupoutside', onUp),
    );
  }

  /** Current slider value (already clamped + quantised). */
  getValue(): number {
    return this.currentValue;
  }

  /** Programmatic value update — repaints the handle without firing
   *  `onChange` (use for external syncs that already know the value). */
  setValue(v: number): void {
    this.currentValue = this.clampAndStep(v);
    this.repaint();
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.container.destroy({ children: true });
  }

  private clampAndStep(v: number): number {
    const clamped = Math.min(this.opts.max, Math.max(this.opts.min, v));
    if (!this.opts.step) return clamped;
    // Round to step, then snap precision so floating-point doesn't
    // drift the displayed value off the notch (0.05 → 0.0500000001).
    const stepped = Math.round(clamped / this.opts.step) * this.opts.step;
    const decimals = Math.max(0, -Math.floor(Math.log10(this.opts.step)));
    return Number(stepped.toFixed(decimals + 2));
  }

  private updateFromPointer(e: FederatedPointerEvent): void {
    const local = this.container.toLocal(e.global);
    const trackX = HANDLE_RADIUS;
    const trackW = this.opts.width - HANDLE_RADIUS * 2;
    const frac = Math.min(1, Math.max(0, (local.x - trackX) / trackW));
    const raw = this.opts.min + frac * (this.opts.max - this.opts.min);
    const next = this.clampAndStep(raw);
    if (next === this.currentValue) return;
    this.currentValue = next;
    this.repaint();
    this.opts.onChange(next);
  }

  private repaint(): void {
    const midY = this.opts.height / 2;
    const trackX = HANDLE_RADIUS;
    const trackW = this.opts.width - HANDLE_RADIUS * 2;
    const frac = (this.currentValue - this.opts.min) / (this.opts.max - this.opts.min);
    const handleX = trackX + trackW * frac;

    this.fillGfx
      .clear()
      .roundRect(trackX, midY - TRACK_HEIGHT / 2, trackW * frac, TRACK_HEIGHT, 2)
      .fill({ color: COLORS.borderActive });

    this.handleGfx
      .clear()
      .circle(handleX, midY, HANDLE_RADIUS)
      .fill({ color: COLORS.buttonBg })
      .stroke({ color: COLORS.borderActive, width: 2 });
    // The container itself owns the hit zone (its full `width`×`height`
    // box), so the handle stays passive — taps anywhere on the slider
    // box are valid click-to-jump targets.
    this.handleGfx.eventMode = 'none';
  }
}
