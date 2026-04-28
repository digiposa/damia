import { Container, Graphics, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { ForestScene } from './ForestOfSeles/ForestScene';

export class GameOverScene implements Scene {
  readonly name = 'game-over';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;

  enter(ctx: GameContext): void {
    const { width, height } = ctx.app.screen;
    this.container = new Container({ label: 'game-over-scene' });

    const bg = new Graphics().rect(0, 0, width, height).fill(0x1a0606);
    this.container.addChild(bg);

    const title = new Text({
      text: t('gameOver.title'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 64,
        fill: 0xff5050,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5);
    title.position.set(width / 2, height / 2 - 40);

    const subtitle = new Text({
      text: t('gameOver.subtitle'),
      style: { fontFamily: 'system-ui, sans-serif', fontSize: 22, fill: 0xddcccc },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, height / 2 + 30);

    this.container.addChild(title, subtitle);
    ctx.app.stage.addChild(this.container);

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'r' || e.key === 'R') {
        // Defer to avoid teardown-during-event issues.
        queueMicrotask(() => {
          void ctx.scenes.switchTo(new ForestScene(), ctx);
        });
      }
    };
    window.addEventListener('keydown', onKey);
    this.cleanupKey = () => window.removeEventListener('keydown', onKey);
  }

  exit(ctx: GameContext): void {
    this.cleanupKey?.();
    this.cleanupKey = null;
    if (this.container) {
      ctx.app.stage.removeChild(this.container);
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  update(): void {}
}
