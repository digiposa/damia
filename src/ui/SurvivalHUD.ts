import type { Application } from 'pixi.js';
import { Container, Text } from 'pixi.js';
import { t } from '@services/I18nService';
import { SafeArea } from '@services/SafeArea';
import { COLORS, TEXT } from './theme';

/** Offset from the very top, in addition to SafeArea.top. Sits below the
 *  shared Hud strip (portrait + bars + level/xp + gold), which extends
 *  to roughly y ≈ 105 from the top edge. */
const TOP_OFFSET = 112;
const SECTION_GAP = 4;
const TIMER_HEIGHT = 32;
const SUBLINE_HEIGHT = 18;

const STROKE = { color: COLORS.textStroke, width: 3 } as const;

export interface SurvivalHUDState {
  /** Run elapsed time in ms. */
  elapsedMs: number;
  /** 1-based wave number for display. */
  wave: number;
  /** Total mobs killed during the run. */
  kills: number;
}

/**
 * Top-center overlay for Survival mode: large run timer with the current
 * wave number and kill counter stacked under it. Renders on the shared
 * UI layer — the scene mounts + ticks it, the controller doesn't know
 * it exists (kept out of the engine so Story zones don't pay the cost).
 *
 * Positioned below the standard Hud's bottom edge so the bars (which
 * cover x ≈ 12..295 in portrait mobile) don't get crossed by the timer
 * text. The vertical menu button column on the right (x ≈ screen-44)
 * doesn't reach down this far, so the center is clear.
 */
export class SurvivalHUD {
  readonly container: Container;
  private readonly app: Application;
  private readonly timerText: Text;
  private readonly waveText: Text;
  private readonly killsText: Text;
  private readonly onResize: () => void;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'survival-hud' });

    this.timerText = new Text({
      text: '0:00',
      style: { ...TEXT.title, fontSize: 28, fill: COLORS.textCream, stroke: STROKE },
    });
    this.timerText.anchor.set(0.5, 0);

    this.waveText = new Text({
      text: '',
      style: { ...TEXT.value, fontSize: 14, fill: COLORS.gold, stroke: STROKE },
    });
    this.waveText.anchor.set(0.5, 0);

    this.killsText = new Text({
      text: '',
      style: { ...TEXT.value, fontSize: 13, fill: COLORS.textCream, stroke: STROKE },
    });
    this.killsText.anchor.set(0.5, 0);

    this.container.addChild(this.timerText, this.waveText, this.killsText);

    this.onResize = (): void => this.reposition();
    this.reposition();
    app.renderer.on('resize', this.onResize);
  }

  setState(state: SurvivalHUDState): void {
    this.timerText.text = formatTimer(state.elapsedMs);
    this.waveText.text = t('survival.hud.wave', { n: state.wave });
    this.killsText.text = t('survival.hud.kills', { n: state.kills });
  }

  destroy(): void {
    this.app.renderer.off('resize', this.onResize);
    this.container.destroy({ children: true });
  }

  private reposition(): void {
    const cx = this.app.screen.width / 2;
    this.container.position.set(cx, TOP_OFFSET + SafeArea.top);
    this.timerText.position.set(0, 0);
    this.waveText.position.set(0, TIMER_HEIGHT + SECTION_GAP);
    this.killsText.position.set(0, TIMER_HEIGHT + SUBLINE_HEIGHT + SECTION_GAP * 2);
  }
}

function formatTimer(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
