import type { GameContext } from '@/Game';
import { AssetManager } from '@services/AssetManager';
import { showLoadingChip, hideLoadingChip } from '@ui/LoadingChip';
import type { Scene } from './Scene';

/**
 * Delay (ms) before the loading chip is shown during a scene change.
 * Scene swaps where the required tags are already cached complete in a
 * few ms — flashing a chip for that round-trip looks like UI jank.
 * Anything slower than the grace period gets the chip so the user sees
 * the system is busy. Hidden again as soon as the prefetch completes.
 */
const LOADING_CHIP_GRACE_MS = 200;

export class SceneManager {
  private current: Scene | null = null;

  async switchTo(next: Scene, ctx: GameContext): Promise<void> {
    const prev = this.current;
    if (prev) {
      await prev.exit(ctx);
    }

    // Prefetch the destination's required assets BEFORE running its
    // `enter()`. This guarantees `AssetManager.getTexture()` calls inside
    // the scene's setup return loaded textures (no fallback shapes during
    // the first frame). Cached aliases resolve instantly so the chip is
    // only shown after a 200 ms grace.
    const requiredTags = next.requiredTags ?? [];
    if (requiredTags.length > 0) {
      const chipTimer = window.setTimeout(() => showLoadingChip(), LOADING_CHIP_GRACE_MS);
      try {
        await AssetManager.loadCategories(requiredTags, (loaded, total) => {
          // Only update the chip text if it's already visible — avoids
          // touching the DOM for cached scene changes that never show it.
          if (loaded > 0) showLoadingChip(loaded, total);
        });
      } finally {
        clearTimeout(chipTimer);
        hideLoadingChip();
      }
    }

    // Drop refcounts the previous scene held AFTER the new scene's
    // tags are pinned, so shared aliases don't get destroyed and
    // immediately reloaded across a Forest → Forest reload or two
    // sibling zones sharing tiles.
    const prevTags = prev?.requiredTags ?? [];
    if (prevTags.length > 0) {
      AssetManager.unloadCategories(prevTags);
    }

    this.current = next;
    await next.enter(ctx);
  }

  update(dt: number, ctx: GameContext): void {
    this.current?.update(dt, ctx);
  }

  get currentScene(): Scene | null {
    return this.current;
  }
}
