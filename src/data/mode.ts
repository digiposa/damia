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
  /** Whether the scene mounts a Fog-of-War / VisionHalo overlay. Off in
   *  Survival so the player sees the whole arena. */
  readonly fogOfWar: boolean;
  /** Target run length in seconds — used to pace wave spawning and
   *  difficulty escalation. Story mode doesn't read this. */
  readonly targetRunSec: number;
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
    // Temporarily set to 1.0 to test whether the "release goes south"
    // bug on Arena is zoom-related. Will restore to 0.7 once the joystick
    // issue is isolated.
    cameraZoom: 1.0,
    fogOfWar: false,
    targetRunSec: 1200, // 20 min target run length
  },
};
