/**
 * Game mode discriminator + per-mode tuning. The engine systems read these
 * constants instead of hard-coding behaviour so future divergences (camera
 * zoom, mob density, XP curve, run length…) all live in one file and the
 * rest of the codebase stays agnostic.
 *
 * Survival = TitleScene's roguelike-arena path. Story = the TLoD-faithful
 * Forest/Hellena chain.
 */
export type GameMode = 'story' | 'survival';

export interface ModeTuning {
  readonly label: string;
  /** pixi-viewport zoom multiplier applied at scene enter. Higher = more
   *  zoomed in. Survival is pulled out a notch so the player can read
   *  incoming waves earlier. */
  readonly cameraZoom: number;
  /** When true, `cameraZoom` is treated as a *mobile-baseline* value and
   *  multiplied at scene enter by `min(screen.w, screen.h) / referenceMinDim`
   *  (clamped at ≥ 1× so mobile stays untouched). Keeps the on-screen
   *  visible-area roughly consistent across devices instead of letting
   *  larger viewports show way more of the world at the same numeric
   *  zoom. Survival opts in because the configured 0.7 was tuned on a
   *  mobile portrait viewport and looked over-zoomed-out on desktop.
   *  Off by default to preserve historical per-scene zoom feel. */
  readonly cameraZoomScalesWithViewport?: boolean;
  /** Whether the scene mounts a Fog-of-War / VisionHalo overlay. Off in
   *  Survival so the player sees the whole arena. */
  readonly fogOfWar: boolean;
  /** Target run length in seconds — used to pace wave spawning and
   *  difficulty escalation. Story mode doesn't read this. */
  readonly targetRunSec: number;
}

/** Mobile-portrait baseline used by `cameraZoomScalesWithViewport`.
 *  Anything narrower than this stays at 1× (no down-scaling). Picked at
 *  ~iPhone 13/14 width — a typical thumb-reachable portrait viewport. */
export const CAMERA_ZOOM_REFERENCE_MIN_DIM = 420;

/**
 * Resolve a configured camera zoom against the current viewport, honouring
 * `cameraZoomScalesWithViewport`. Returns the value to hand to
 * `viewport.setZoom`. Pure / synchronous — call it on scene enter and on
 * window resize.
 */
export function effectiveCameraZoom(
  configuredZoom: number,
  scalesWithViewport: boolean,
  screenWidth: number,
  screenHeight: number,
): number {
  if (!scalesWithViewport) return configuredZoom;
  const minDim = Math.min(screenWidth, screenHeight);
  const factor = Math.max(1.0, minDim / CAMERA_ZOOM_REFERENCE_MIN_DIM);
  return configuredZoom * factor;
}

export const MODE_TUNING: Readonly<Record<GameMode, ModeTuning>> = {
  story: {
    label: 'Story',
    cameraZoom: 1.0,
    fogOfWar: true,
    targetRunSec: 0,
  },
  survival: {
    label: 'Survival',
    cameraZoom: 0.7,
    // Tuned on a mobile portrait viewport — scale up on wider screens
    // so a desktop player sees roughly the same number of tiles instead
    // of an over-dezoomed arena.
    cameraZoomScalesWithViewport: true,
    fogOfWar: false,
    targetRunSec: 1200, // 20 min target run length
  },
};
