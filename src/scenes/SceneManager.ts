import type { GameContext } from '@/Game';
import type { Scene } from './Scene';

export class SceneManager {
  private current: Scene | null = null;

  async switchTo(next: Scene, ctx: GameContext): Promise<void> {
    if (this.current) {
      await this.current.exit(ctx);
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
