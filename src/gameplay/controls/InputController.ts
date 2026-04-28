import type { Application, FederatedPointerEvent } from 'pixi.js';
import type { Viewport } from 'pixi-viewport';
import { worldToGrid } from '@core/math/iso';

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
 * - Key `S` (down/up) → defend on/off
 *
 * Resolution from a click cell to "attack target vs move" lives in the scene.
 */
export class InputController {
  private clickListeners = new Set<Listener<ClickCommand>>();
  private cameraFollowListeners = new Set<Listener<boolean>>();
  private defendListeners = new Set<Listener<boolean>>();
  private cameraFollowState = false;
  private defendState = false;
  private readonly cleanupFns: Array<() => void> = [];

  constructor(opts: InputControllerOptions) {
    const { app, viewport, gridWidth, gridHeight } = opts;
    viewport.eventMode = 'static';
    viewport.cursor = 'pointer';

    const onPointerUp = (e: FederatedPointerEvent): void => {
      let button: ClickButton;
      if (e.button === 0) button = 'left';
      else if (e.button === 2) button = 'right';
      else return;

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
      } else if ((e.key === 's' || e.key === 'S') && !this.defendState) {
        this.defendState = true;
        this.defendListeners.forEach((l) => l(true));
      }
    };
    const onKeyUp = (e: KeyboardEvent): void => {
      if ((e.key === 's' || e.key === 'S') && this.defendState) {
        this.defendState = false;
        this.defendListeners.forEach((l) => l(false));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown));
    this.cleanupFns.push(() => window.removeEventListener('keyup', onKeyUp));
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

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.clickListeners.clear();
    this.cameraFollowListeners.clear();
    this.defendListeners.clear();
  }
}
