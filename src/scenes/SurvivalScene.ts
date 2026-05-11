import { Container, Graphics, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { playSfx } from '@services/AudioManager';
import { TitleScene } from './TitleScene';

/**
 * Placeholder for the upcoming roguelike-survival mode. Splash card with a
 * "coming soon" label + a Back button that returns to the title screen,
 * so the mode-picker slot in TitleScene already routes somewhere real.
 *
 * The actual gameplay (wave spawner, level-up choices, run scoreboard)
 * will replace this scene's body when the design lands — the entry path
 * from TitleScene won't need to change.
 */
export class SurvivalScene implements Scene {
  readonly name = 'survival';
  private container: Container | null = null;

  enter(ctx: GameContext): void {
    const { width, height } = ctx.app.screen;
    this.container = new Container({ label: 'survival-scene' });

    // Dim wash so the splash reads even if a noisy background ever lands here.
    const bg = new Graphics().rect(0, 0, width, height).fill(0x0c1218);
    this.container.addChild(bg);

    const title = new Text({
      text: t('survival.title'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 44,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      },
    });
    title.anchor.set(0.5);
    title.position.set(width / 2, height / 2 - 60);

    const subtitle = new Text({
      text: t('survival.subtitle'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        fill: 0xc8b58a,
        fontStyle: 'italic',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 48,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(width / 2, height / 2 - 10);

    const comingSoon = new Text({
      text: t('survival.comingSoon'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fill: 0xeec040,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
      },
    });
    comingSoon.anchor.set(0.5);
    comingSoon.position.set(width / 2, height / 2 + 40);

    // Back button — tactile-friendly size, sits below the splash.
    const btnW = 240;
    const btnH = 52;
    const btn = new Container({ label: 'survival-back-btn' });
    const btnBg = new Graphics()
      .roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 8)
      .fill({ color: 0x202820, alpha: 0.95 })
      .stroke({ width: 2, color: 0xa08050 });
    const btnLabel = new Text({
      text: t('survival.backToTitle'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
      },
    });
    btnLabel.anchor.set(0.5);
    btn.addChild(btnBg, btnLabel);
    btn.position.set(width / 2, height / 2 + 120);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointertap', () => {
      playSfx('ui.click');
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      });
    });

    this.container.addChild(title, subtitle, comingSoon, btn);
    ctx.app.stage.addChild(this.container);
  }

  exit(ctx: GameContext): void {
    if (this.container) {
      ctx.app.stage.removeChild(this.container);
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  update(): void {}
}
