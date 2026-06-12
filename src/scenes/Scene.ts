import type { GameContext } from '@/Game';
import type { AssetTag } from '@services/AssetManager';

export interface Scene {
  readonly name: string;
  /**
   * Asset tags the scene needs resident before `enter()` fires. The
   * SceneManager preloads (and ref-counts) them via
   * `AssetManager.loadCategories()` during `switchTo`, and drops the
   * refcounts on `exit()` so memory frees as the player navigates.
   *
   * Scenes that don't depend on lazy assets (or rely entirely on the
   * always-resident `core` slice) can omit the field; an empty / missing
   * list short-circuits both the prefetch and the unload pass.
   */
  readonly requiredTags?: readonly AssetTag[];
  enter(ctx: GameContext): void | Promise<void>;
  exit(ctx: GameContext): void | Promise<void>;
  update(dt: number, ctx: GameContext): void;
}
