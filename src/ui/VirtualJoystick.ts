import { Container, Graphics } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';

const BASE_RADIUS_PX = 60;
const THUMB_RADIUS_PX = 28;
/** Edge-padding from the bottom-left corner of the screen. */
const PADDING_PX = 24;
/** Below this fraction of BASE_RADIUS the joystick is considered idle (thumb
 *  re-centred, no direction emitted). Avoids jittery output around the
 *  centre. */
const DEAD_ZONE_FRAC = 0.18;

/**
 * On-screen analog stick for touch devices. Drawn bottom-left as a
 * semi-transparent ring + thumb; the thumb tracks the player's finger and
 * clamps to the ring radius. Emits a normalised (dx, dy) vector each frame
 * the thumb is held outside the dead zone — `direction()` returns null
 * otherwise.
 *
 * The hit zone is the BASE area; the thumb itself isn't interactive (the
 * ring catches all moves, including drags that originate on the thumb).
 *
 * Purely visual + state holder — turning a direction into in-game movement
 * is the scene's job (it polls `direction()` each frame and re-targets the
 * pathfinder accordingly).
 */
export class VirtualJoystick {
  readonly container: Container;
  private app: Application;
  private base: Graphics;
  private thumb: Graphics;
  /** Centre of the joystick base in the container's local coords. With the
   *  container positioned in `reposition()`, this stays at (0, 0). */
  private centreX = 0;
  private centreY = 0;
  /** Active pointer id while a touch is held; null when idle. We track ID so
   *  a second finger landing on the joystick doesn't hijack the first. */
  private activePointerId: number | null = null;
  private dirX = 0;
  private dirY = 0;
  private cleanupFns: Array<() => void> = [];

  constructor(app: Application) {
    this.app = app;

    this.container = new Container({ label: 'virtual-joystick' });
    // Anchor the base at (0, 0) so `reposition()` can place the container at
    // the joystick's CENTRE coords directly.
    this.base = new Graphics()
      .circle(0, 0, BASE_RADIUS_PX)
      .fill({ color: 0x000000, alpha: 0.35 })
      .stroke({ width: 2, color: 0xfaf6e8, alpha: 0.5 });
    this.thumb = new Graphics()
      .circle(0, 0, THUMB_RADIUS_PX)
      .fill({ color: 0xfaf6e8, alpha: 0.7 })
      .stroke({ width: 2, color: 0x000000, alpha: 0.6 });
    this.container.addChild(this.base, this.thumb);

    // Make the BASE the hit-target so the thumb isn't itself interactive —
    // simplifies the drag flow (one pointer source).
    this.base.eventMode = 'static';
    this.base.cursor = 'pointer';

    const onPointerDown = (e: FederatedPointerEvent): void => {
      // Always take over on a fresh pointerdown — never reject because of a
      // prior `activePointerId` left dangling. If the previous touch was
      // cancelled in some path that didn't fire pointercancel, the guard
      // would otherwise wedge the joystick permanently. Multi-touch
      // conflicts are still avoided because move/up only react to the
      // currently-tracked id.
      this.activePointerId = e.pointerId;
      this.updateThumbFromGlobal(e.global.x, e.global.y);
    };
    this.base.on('pointerdown', onPointerDown);
    this.cleanupFns.push(() => this.base.off('pointerdown', onPointerDown));

    // Track move + end at the DOM/window level rather than via Pixi stage
    // events. Pixi doesn't forward `pointercancel`, and mobile browsers fire
    // exactly that when they decide a sustained touch is a system gesture
    // (scroll/pull-to-refresh) — leaving `activePointerId` stuck and the
    // joystick frozen on first use. Window listeners also keep tracking
    // when the finger drags off-canvas, which Pixi's stage pointermove
    // doesn't always cover reliably on mobile.
    const canvas = app.canvas;
    const onDomMove = (e: PointerEvent): void => {
      if (this.activePointerId !== e.pointerId) return;
      const rect = canvas.getBoundingClientRect();
      this.updateThumbFromGlobal(e.clientX - rect.left, e.clientY - rect.top);
    };
    const onDomEnd = (e: PointerEvent): void => {
      if (this.activePointerId !== e.pointerId) return;
      this.release();
    };
    window.addEventListener('pointermove', onDomMove, { passive: true });
    window.addEventListener('pointerup', onDomEnd);
    window.addEventListener('pointercancel', onDomEnd);
    this.cleanupFns.push(
      () => window.removeEventListener('pointermove', onDomMove),
      () => window.removeEventListener('pointerup', onDomEnd),
      () => window.removeEventListener('pointercancel', onDomEnd),
    );

    this.reposition();
    const onResize = (): void => this.reposition();
    app.renderer.on('resize', onResize);
    this.cleanupFns.push(() => app.renderer.off('resize', onResize));
  }

  /** Returns the current joystick direction as a normalised vector with
   *  magnitude ∈ [DEAD_ZONE_FRAC, 1]. Null when the joystick is idle (thumb
   *  released or inside the dead zone). The scene polls this each frame. */
  direction(): { x: number; y: number; magnitude: number } | null {
    const mag = Math.hypot(this.dirX, this.dirY);
    if (mag < DEAD_ZONE_FRAC) return null;
    // Re-normalise so the magnitude reads as 0..1 after dead-zone clamp,
    // which makes the downstream "how aggressively am I moving?" easier to
    // reason about (1 = thumb at the ring edge).
    return { x: this.dirX / mag, y: this.dirY / mag, magnitude: mag };
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.container.destroy({ children: true });
  }

  /** Map a canvas-space pointer position (CSS-pixel coords relative to the
   *  canvas top-left) to a thumb offset clamped to the base radius, then
   *  update the visible thumb + dirX/dirY. Accepts plain numbers so the
   *  same path serves both the Pixi pointerdown event (e.global) and the
   *  DOM move/up listeners (clientX/Y minus canvas bbox). */
  private updateThumbFromGlobal(globalX: number, globalY: number): void {
    const local = this.container.toLocal({ x: globalX, y: globalY });
    const dx = local.x - this.centreX;
    const dy = local.y - this.centreY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, BASE_RADIUS_PX);
    const angle = Math.atan2(dy, dx);
    const tx = Math.cos(angle) * clampedDist;
    const ty = Math.sin(angle) * clampedDist;
    this.thumb.position.set(tx, ty);
    this.dirX = tx / BASE_RADIUS_PX;
    this.dirY = ty / BASE_RADIUS_PX;
  }

  private release(): void {
    this.activePointerId = null;
    this.thumb.position.set(0, 0);
    this.dirX = 0;
    this.dirY = 0;
  }

  private reposition(): void {
    // Bottom-left corner with PADDING — container origin = joystick centre,
    // so add BASE_RADIUS to clear the screen edge.
    this.container.position.set(
      PADDING_PX + BASE_RADIUS_PX,
      this.app.screen.height - PADDING_PX - BASE_RADIUS_PX,
    );
  }
}
