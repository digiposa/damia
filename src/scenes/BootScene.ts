import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { ForestScene } from './ForestOfSeles/ForestScene';

export class BootScene implements Scene {
  readonly name = 'boot';

  async enter(ctx: GameContext): Promise<void> {
    // M1: nothing to load yet, immediately switch to forest.
    // Future: AssetManager preloads here.
    await ctx.scenes.switchTo(new ForestScene(), ctx);
  }

  exit(): void {}

  update(): void {}
}
