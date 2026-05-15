import { Graphics } from 'pixi.js';
import { COLORS } from './theme';

const TRIANGLE_HALF_WIDTH = 8;
const TRIANGLE_HEIGHT = 10;
/** Encounter-meter severity tints. Local because they're scoped to this
 *  indicator — promoting them to theme would lock in semantics that
 *  no other widget needs. */
const SAFE_COLOR = 0x4f8bff;
const CAUTION_COLOR = 0xffd166;
const DANGER_COLOR = 0xe53935;

/**
 * TLoD-style encounter indicator: a small downward-pointing triangle floating
 * above the player's head. Colour signals proximity to a random encounter:
 *  - 0..50%: blue   (safe)
 *  - 50..85%: yellow (caution)
 *  - 85..100%: red  (imminent, pulses alpha)
 *
 * Hidden when frac == 0 (no clutter while the meter is empty). World-space
 * (mounted in the FX layer so it scales/translates with the camera).
 */
export class EncounterIndicator {
  readonly node: Graphics;
  private lastColor = -1;
  private lastShape = false;
  /** Ms accumulated for the red-band pulse animation. */
  private pulseMs = 0;

  constructor() {
    this.node = new Graphics();
    this.node.visible = false;
  }

  /** `frac` in [0, 1]. `dt` in ms drives the red-band pulse. */
  setFill(frac: number, dt: number): void {
    this.pulseMs += dt;
    const clamped = Math.max(0, Math.min(1, frac));
    if (clamped <= 0) {
      this.node.visible = false;
      return;
    }
    this.node.visible = true;

    let color: number;
    let alpha = 1;
    if (clamped < 0.5) color = SAFE_COLOR;
    else if (clamped < 0.85) color = CAUTION_COLOR;
    else {
      color = DANGER_COLOR;
      alpha = 0.65 + 0.35 * Math.abs(Math.sin(this.pulseMs * 0.012));
    }

    // Redraw only when shape needs to exist or colour changed; alpha goes via
    // node.alpha so the pulse doesn't burn a clear/redraw every frame.
    if (!this.lastShape || color !== this.lastColor) {
      this.node.clear();
      this.node
        .poly([-TRIANGLE_HALF_WIDTH, -TRIANGLE_HEIGHT, TRIANGLE_HALF_WIDTH, -TRIANGLE_HEIGHT, 0, 0])
        .fill(color)
        .stroke({ color: COLORS.textStroke, width: 1, alpha: 0.7 });
      this.lastShape = true;
      this.lastColor = color;
    }
    this.node.alpha = alpha;
  }

  /** Position the indicator at world-space (x, y) — typically above the player's head. */
  setPosition(x: number, y: number): void {
    this.node.position.set(x, y);
  }

  destroy(): void {
    this.node.destroy();
  }
}
