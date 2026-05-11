import type { Application, FederatedPointerEvent } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';
import { worldToGrid } from '@core/math/iso';
import { DEFEND } from '@data/balance';

export type ClickButton = 'left' | 'right';

export interface ClickCommand {
  button: ClickButton;
  gx: number;
  gy: number;
}

type Listener<T> = (payload: T) => void;

export interface InputControllerOptions {
  app: Application;
  viewport: Viewport;
  gridWidth: number;
  gridHeight: number;
}

/**
 * Translates raw browser input into game intentions.
 * - Left/right click on a grid cell → ClickCommand
 * - Key `C` → toggle camera follow
 * - Key `S` → trigger 3 s defend (on a 10 s cooldown)
 *
 * Resolution from a click cell to "attack target vs move" lives in the scene.
 */
export class InputController {
  private clickListeners = new Set<Listener<ClickCommand>>();
  private cameraFollowListeners = new Set<Listener<boolean>>();
  private defendListeners = new Set<Listener<boolean>>();
  private slotListeners = new Set<Listener<number>>();
  private cameraFollowState = false;
  private defendState = false;
  /** Time remaining (ms) before the player can press defend again. Counts
   *  down from `DEFEND.cooldownMs` whenever a defend is started, ticked
   *  by the scene calling `tickCooldowns(dt)` each frame. */
  private defendCdRemainingMs = 0;
  private readonly cleanupFns: Array<() => void> = [];
  /** Stored so `emitClick` can clamp synthesised commands (joystick) to the
   *  playable grid — the mouse path already rejects out-of-bounds clicks
   *  inside `onPointerUp`, but the joystick can extrapolate well past the
   *  map edge when held against a corner, which crashed the pathfinder. */
  private readonly gridWidth: number;
  private readonly gridHeight: number;
  /** Predicate set by the scene (defaults to "never ignore") so the
   *  joystick can tell us "this pointer is mine, skip the world click
   *  on its lift-off". Keeps InputController unaware of the
   *  VirtualJoystick instance specifically. */
  private ignorePointerCheck: (pointerId: number) => boolean = () => false;

  /**
   * Physical-key → hotbar slot index (0-based). We match `KeyboardEvent.code`
   * (layout-independent) so AZERTY users don't need Shift to trigger slot 1,
   * and so the numpad works the same as the top row.
   */
  private static readonly SLOT_CODES: Record<string, number> = {
    Digit1: 0,
    Numpad1: 0,
    Digit2: 1,
    Numpad2: 1,
    Digit3: 2,
    Numpad3: 2,
    Digit4: 3,
    Numpad4: 3,
    Digit5: 4,
    Numpad5: 4,
    Digit6: 5,
    Numpad6: 5,
    Digit7: 6,
    Numpad7: 6,
    Digit8: 7,
    Numpad8: 7,
  };

  constructor(opts: InputControllerOptions) {
    const { app, viewport, gridWidth, gridHeight } = opts;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    viewport.eventMode = 'static';
    viewport.cursor = 'pointer';

    const onPointerUp = (e: FederatedPointerEvent): void => {
      let button: ClickButton;
      if (e.button === 0) button = 'left';
      else if (e.button === 2) button = 'right';
      else return;

      // Skip the click when the pointer belongs to an active virtual
      // joystick interaction. When the user pushes the joystick thumb
      // to an edge, the lift point can land outside the joystick base's
      // hit area — Pixi then routes the pointerup to the viewport,
      // which would otherwise emit a tap-to-move click on whatever
      // world tile lies under that screen position (typically south of
      // Dart, since the joystick sits at the bottom-left of the screen).
      // The scene tells us which pointer id owns the joystick so we
      // can let that lift-off pass without firing a click.
      if (this.ignorePointerCheck(e.pointerId)) return;

      const local = viewport.toWorld(e.global);
      const grid = worldToGrid(local.x, local.y);
      const gx = Math.round(grid.x);
      const gy = Math.round(grid.y);
      if (gx < 0 || gy < 0 || gx >= gridWidth || gy >= gridHeight) return;
      const cmd: ClickCommand = { button, gx, gy };
      this.clickListeners.forEach((l) => l(cmd));
    };

    viewport.on('pointerup', onPointerUp);
    this.cleanupFns.push(() => viewport.off('pointerup', onPointerUp));

    const onContextMenu = (e: MouseEvent): void => e.preventDefault();
    app.canvas.addEventListener('contextmenu', onContextMenu);
    this.cleanupFns.push(() => app.canvas.removeEventListener('contextmenu', onContextMenu));

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'c' || e.key === 'C') {
        this.cameraFollowState = !this.cameraFollowState;
        this.cameraFollowListeners.forEach((l) => l(this.cameraFollowState));
      } else if ((e.key === 's' || e.key === 'S') && !e.repeat) {
        // One-shot defend trigger. The scene + DefenseSystem own the
        // 3 s commit; we just gate on the cooldown here.
        this.emitDefend(true);
      } else if (!e.repeat) {
        const slot = InputController.SLOT_CODES[e.code];
        if (slot !== undefined) this.slotListeners.forEach((l) => l(slot));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown));
  }

  onClick(listener: Listener<ClickCommand>): () => void {
    this.clickListeners.add(listener);
    return () => this.clickListeners.delete(listener);
  }

  onCameraFollowToggle(listener: Listener<boolean>): () => void {
    this.cameraFollowListeners.add(listener);
    return () => this.cameraFollowListeners.delete(listener);
  }

  onDefendChange(listener: Listener<boolean>): () => void {
    this.defendListeners.add(listener);
    return () => this.defendListeners.delete(listener);
  }

  onSlot(listener: Listener<number>): () => void {
    this.slotListeners.add(listener);
    return () => this.slotListeners.delete(listener);
  }

  /**
   * External dispatch points — the touch overlay (joystick + on-screen
   * buttons) drives the same event pipeline as keyboard / mouse by calling
   * these instead of synthesising fake DOM events. The scene's listeners
   * don't know or care which input source emitted them.
   */
  /** Wire a filter that vetoes specific pointerIds from emitting a
   *  world click. Used by scenes to keep joystick lift-offs from
   *  silently emitting tap-to-move commands. */
  setIgnorePointerCheck(check: (pointerId: number) => boolean): void {
    this.ignorePointerCheck = check;
  }

  emitClick(cmd: ClickCommand): void {
    // Clamp to the playable grid before dispatching. The joystick projects
    // a target ~5 tiles ahead of the player; pushed against a map edge it
    // produces negative or oversized indices that explode the pathfinder
    // (and freeze the renderer while audio keeps running). Clamping makes
    // edge-pointed joystick walk the player to the border instead.
    const clamped: ClickCommand = {
      button: cmd.button,
      gx: Math.max(0, Math.min(this.gridWidth - 1, cmd.gx)),
      gy: Math.max(0, Math.min(this.gridHeight - 1, cmd.gy)),
    };
    this.clickListeners.forEach((l) => l(clamped));
  }

  /** External dispatch for the defend toggle.
   *  - `active=true` starts a defend stance, but rejects silently if
   *    we're still on cooldown or already defending. Successful starts
   *    arm the cooldown.
   *  - `active=false` clears the state without affecting the cooldown
   *    (the scene calls this after DefenseSystem auto-expires the
   *    `Defending` component). */
  emitDefend(active: boolean): void {
    if (active) {
      if (this.defendState) return;
      if (this.defendCdRemainingMs > 0) return;
      this.defendState = true;
      this.defendCdRemainingMs = DEFEND.cooldownMs;
      this.defendListeners.forEach((l) => l(true));
    } else {
      if (!this.defendState) return;
      this.defendState = false;
      this.defendListeners.forEach((l) => l(false));
    }
  }

  /** Decrement time-based cooldowns. Called from the scene's `update` so
   *  the cooldown advances at the same rate as the rest of the
   *  simulation (same `deltaMS` source). */
  tickCooldowns(deltaMs: number): void {
    if (this.defendCdRemainingMs > 0) {
      this.defendCdRemainingMs = Math.max(0, this.defendCdRemainingMs - deltaMs);
    }
  }

  /** Cooldown progress as a fraction in [0, 1]. 1 = just triggered, 0 =
   *  ready. Used by the defend button to paint a radial wipe overlay. */
  defendCooldownFrac(): number {
    return this.defendCdRemainingMs / DEFEND.cooldownMs;
  }

  /** External dispatch for hotbar slot activation (0..7). Mirrors the
   *  number-key path so the touch hotbar can re-use the slot-resolve logic. */
  emitSlot(slotIdx: number): void {
    this.slotListeners.forEach((l) => l(slotIdx));
  }

  /** Current defend state — used by the touch UI's defend button to draw the
   *  ON/OFF visual from a single source of truth. */
  isDefending(): boolean {
    return this.defendState;
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.clickListeners.clear();
    this.cameraFollowListeners.clear();
    this.defendListeners.clear();
    this.slotListeners.clear();
  }
}
