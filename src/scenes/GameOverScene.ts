import { Container, Graphics, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import type { GameMode } from '@data/mode';
import { ForestScene } from './ForestOfSeles/ForestScene';
import { ArenaScene } from './Arena/ArenaScene';
import { TitleScene } from './TitleScene';

const BTN_WIDTH = 240;
const BTN_HEIGHT = 56;
const BTN_GAP = 14;

/**
 * Death overlay. Knows which mode the player died in so the "Restart"
 * button starts a fresh run of THAT mode instead of always dropping the
 * player into Story. A second button takes them back to the title.
 *
 * Backwards-compat default is `mode: 'story'` — old call sites that
 * `new GameOverScene()` still route through Forest.
 */
export class GameOverScene implements Scene {
  readonly name = 'game-over';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;

  constructor(private readonly mode: GameMode = 'story') {}

  enter(ctx: GameContext): void {
    const { width, height } = ctx.app.screen;
    this.container = new Container({ label: 'game-over-scene' });

    const bg = new Graphics().rect(0, 0, width, height).fill(0x1a0606);
    this.container.addChild(bg);

    const restart = (): void => {
      // Defer scene swap to avoid tearing down listeners mid-event.
      queueMicrotask(() => {
        const next: Scene = this.mode === 'survival' ? new ArenaScene() : new ForestScene();
        void ctx.scenes.switchTo(next, ctx);
      });
    };
    const backToTitle = (): void => {
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      });
    };

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
    title.position.set(width / 2, height / 2 - 90);

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
    subtitle.position.set(width / 2, height / 2 - 24);

    const restartBtn = this.makeButton(
      t('gameOver.restart'),
      width / 2,
      height / 2 + 40,
      { fill: 0x882222, stroke: 0xff7070 },
      restart,
    );
    const titleBtn = this.makeButton(
      t('survival.backToTitle'),
      width / 2,
      height / 2 + 40 + BTN_HEIGHT + BTN_GAP,
      { fill: 0x2a2a36, stroke: 0xa08050 },
      backToTitle,
    );

    this.container.addChild(title, subtitle, restartBtn, titleBtn);
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

  private makeButton(
    label: string,
    x: number,
    y: number,
    colours: { fill: number; stroke: number },
    onTap: () => void,
  ): Container {
    const container = new Container({ label: `gameover-btn-${label}` });
    const bg = new Graphics()
      .roundRect(-BTN_WIDTH / 2, -BTN_HEIGHT / 2, BTN_WIDTH, BTN_HEIGHT, 8)
      .fill({ color: colours.fill, alpha: 0.95 })
      .stroke({ width: 3, color: colours.stroke, alpha: 0.9 });
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    container.addChild(bg, text);
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', (e) => {
      e.stopPropagation();
      onTap();
    });
    return container;
  }
}
