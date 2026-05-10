import { Container, Graphics, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { ForestScene } from './ForestOfSeles/ForestScene';

const BTN_WIDTH = 220;
const BTN_HEIGHT = 60;

export class GameOverScene implements Scene {
  readonly name = 'game-over';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;

  enter(ctx: GameContext): void {
    const { width, height } = ctx.app.screen;
    this.container = new Container({ label: 'game-over-scene' });

    // Make the whole backdrop a tap target so a careless poke anywhere on
    // the screen also restarts — convenient on mobile when you don't want
    // to aim for the small button.
    const bg = new Graphics().rect(0, 0, width, height).fill(0x1a0606);
    bg.eventMode = 'static';
    bg.cursor = 'pointer';
    this.container.addChild(bg);

    const restart = (): void => {
      // Defer the scene swap to avoid tearing down listeners while one of
      // them is still firing.
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new ForestScene(), ctx);
      });
    };
    bg.on('pointertap', restart);

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
    title.position.set(width / 2, height / 2 - 60);

    const subtitle = new Text({
      text: t('gameOver.subtitle'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 18,
        fill: 0xddcccc,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 40,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, height / 2 + 10);

    // Big restart button — primary tap target. Sits below the subtitle so
    // mobile thumbs land on it naturally without scrolling the eye.
    const btnContainer = new Container({ label: 'gameover-restart-btn' });
    const btnBg = new Graphics()
      .roundRect(-BTN_WIDTH / 2, -BTN_HEIGHT / 2, BTN_WIDTH, BTN_HEIGHT, 8)
      .fill({ color: 0x882222, alpha: 0.95 })
      .stroke({ width: 3, color: 0xff7070, alpha: 0.9 });
    const btnLabel = new Text({
      text: t('gameOver.restart'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 26,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
      },
    });
    btnLabel.anchor.set(0.5);
    btnContainer.addChild(btnBg, btnLabel);
    btnContainer.position.set(width / 2, height / 2 + 90);
    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';
    btnContainer.on('pointertap', (e) => {
      // Stop the bubble so the backdrop doesn't double-fire restart() and
      // queue two scene swaps for the same tap.
      e.stopPropagation();
      restart();
    });

    this.container.addChild(title, subtitle, btnContainer);
    ctx.app.stage.addChild(this.container);

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'r' || e.key === 'R') restart();
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
