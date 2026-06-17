import type { Application, Container, EventMode, FederatedPointerEvent } from 'pixi.js';
import { Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import { COLORS } from './theme';

/**
 * Reusable horizontal drag-slider. Track + filled portion + draggable
 * handle, with click-to-jump on the track.
 *
 * Drag tracking: stage-level pointermove / pointerup listeners are
 * attached only WHILE a drag is in progress and torn down the moment it
 * ends (or the slider is destroyed). This is deliberate — a settings
 * Modal is hidden via `visible = false`, not destroyed, so anything the
 * slider leaves bound to `app.stage` would linger across the whole
 * session and could hijack world pointer input (tap-to-move, the
 * attack-cursor hover) long after the panel closed. Idle sliders keep a
 * single local `pointerdown` on their own box and nothing global.
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
  private readonly stage: Container;
  private opts: SliderOptions;
  private trackGfx: Graphics;
  private fillGfx: Graphics;
  private handleGfx: Graphics;
  private currentValue: number;
  private dragging = false;
  private activePointerId: number | null = null;
  /** Stage eventMode captured at drag-start so we can restore it exactly
   *  when the drag ends — the slider never permanently mutates global
   *  input state. */
  private prevStageEventMode: EventMode | null = null;
  private readonly onMove: (e: FederatedPointerEvent) => void;
  private readonly onUp: (e: FederatedPointerEvent) => void;

  constructor(app: Application, opts: SliderOptions) {
    this.stage = app.stage;
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

    this.onMove = (e: FederatedPointerEvent): void => {
      if (!this.dragging || this.activePointerId !== e.pointerId) return;
      this.updateFromPointer(e);
    };
    this.onUp = (e: FederatedPointerEvent): void => {
      if (this.activePointerId !== e.pointerId) return;
      this.endDrag();
    };
    // Drag starts on a press anywhere in the slider's own box (which is
    // also the click-to-jump). The global move/up listeners are bound
    // here, in `beginDrag`, and unbound in `endDrag`.
    this.container.on('pointerdown', (e: FederatedPointerEvent) => {
      if (this.activePointerId !== null) return;
      this.activePointerId = e.pointerId;
      this.beginDrag();
      this.updateFromPointer(e);
    });
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
    // Detach any in-flight drag listeners (covers destroy-mid-drag).
    this.endDrag();
    this.container.destroy({ children: true });
  }

  private beginDrag(): void {
    this.dragging = true;
    this.handleGfx.tint = COLORS.borderActive;
    // The stage must be interactive to receive the bubbled move/up while
    // the pointer roams off the slider; capture + restore the prior mode.
    this.prevStageEventMode = this.stage.eventMode ?? 'auto';
    this.stage.eventMode = 'static';
    this.stage.on('pointermove', this.onMove);
    this.stage.on('pointerup', this.onUp);
    this.stage.on('pointerupoutside', this.onUp);
  }

  private endDrag(): void {
    this.stage.off('pointermove', this.onMove);
    this.stage.off('pointerup', this.onUp);
    this.stage.off('pointerupoutside', this.onUp);
    if (this.prevStageEventMode !== null) {
      this.stage.eventMode = this.prevStageEventMode;
      this.prevStageEventMode = null;
    }
    if (this.dragging) {
      this.dragging = false;
      this.handleGfx.tint = 0xffffff;
    }
    this.activePointerId = null;
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
