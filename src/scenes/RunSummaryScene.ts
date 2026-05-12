import { Container, Graphics, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { playSfx } from '@services/AudioManager';
import { RunHighScores, type SurvivalRunRecord } from '@services/RunHighScores';
import { SafeArea } from '@services/SafeArea';
import { UnlockManager } from '@services/UnlockManager';
import { ArenaScene } from './Arena/ArenaScene';
import { TitleScene } from './TitleScene';
import { CHARACTERS, type CharacterDef, type CharacterId } from '@data/characters';

const BTN_WIDTH = 240;
const BTN_HEIGHT = 52;
const BTN_GAP = 12;
const CARD_WIDTH = 320;
const ROW_GAP = 26;
const SCORES_GAP = 22;

const COLOR_BG = 0x0e1a28;
const COLOR_CARD = 0x1c2840;
const COLOR_CARD_STROKE = 0xa08050;
const COLOR_TITLE = 0xfaf6e8;
const COLOR_LABEL = 0xa9b3c7;
const COLOR_VALUE = 0xfaf6e8;
const COLOR_HIGHLIGHT = 0xffd166;
const COLOR_RECORD_BANNER = 0xb88030;

/** Stats from the just-ended run, fed into the scene by ArenaScene's
 *  onPlayerDeath hook. The scene submits this to RunHighScores on enter
 *  and reads the assigned rank to drive the "Nouveau record" banner. */
export interface RunSummaryInput {
  ms: number;
  wave: number;
  kills: number;
  level: number;
  /** Character that ran. Passed back to ArenaScene on Replay so the
   *  player keeps their pick without going back through the selector. */
  character: CharacterDef;
}

/**
 * End-of-run recap for Survival mode. Routed to instead of the generic
 * GameOverScene when the player dies in the Arena. Shows:
 *
 *  - Time survived (mm:ss), highest wave reached, kills, level reached.
 *  - "Nouveau record !" banner if the run landed in the top-N table.
 *  - Top-5 leaderboard with the just-submitted run highlighted at its
 *    rank.
 *  - Two buttons: Rejouer (fresh ArenaScene) and Retour au menu.
 *
 * Reads + writes localStorage via the RunHighScores service so future
 * meta-progression screens (character unlocks, lifetime kill counters,
 * etc.) can plug into the same store without coupling to this scene.
 */
export class RunSummaryScene implements Scene {
  readonly name = 'run-summary';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;

  constructor(private readonly input: RunSummaryInput) {}

  enter(ctx: GameContext): void {
    const { width: screenW, height: screenH } = ctx.app.screen;
    this.container = new Container({ label: 'run-summary-scene' });

    // Build + submit the record first so we know our rank before
    // drawing the leaderboard (we need it to pick which row to
    // highlight).
    const record: SurvivalRunRecord = {
      ms: this.input.ms,
      wave: this.input.wave,
      kills: this.input.kills,
      level: this.input.level,
      character: this.input.character.id,
      savedAtMs: Date.now(),
    };
    const rank = RunHighScores.submit(record);
    const top = RunHighScores.load();
    // Test the run against every gated character. Returns the list of
    // characters that just transitioned from locked → unlocked; the
    // service has already persisted them. We surface the first new
    // unlock as a celebratory banner — multi-unlock runs are rare
    // enough at v1 that one banner is fine.
    const newlyUnlocked = UnlockManager.evaluateUnlocks(record);

    const bg = new Graphics().rect(0, 0, screenW, screenH).fill(COLOR_BG);
    this.container.addChild(bg);

    const cx = screenW / 2;
    // Vertical layout: title → record banner (if any) → run stats card
    // → leaderboard → buttons. We anchor everything off the screen
    // centre with safe-area-aware top padding so the layout works on
    // notched iPhones in portrait.
    let cursorY = 40 + SafeArea.top;

    const title = new Text({
      text: t('survival.summary.title'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 30,
        fill: COLOR_TITLE,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(cx, cursorY);
    this.container.addChild(title);
    cursorY += 50;

    if (rank >= 0) {
      const banner = this.makeRecordBanner(rank);
      banner.position.set(cx, cursorY);
      this.container.addChild(banner);
      cursorY += 44;
    }

    if (newlyUnlocked.length > 0) {
      const banner = this.makeUnlockBanner(newlyUnlocked[0]!);
      banner.position.set(cx, cursorY);
      this.container.addChild(banner);
      cursorY += 44;
    }

    cursorY += 8;
    const statsCard = this.makeStatsCard();
    statsCard.position.set(cx - CARD_WIDTH / 2, cursorY);
    this.container.addChild(statsCard);
    cursorY += this.statsCardHeight() + 24;

    const leaderboard = this.makeLeaderboard(top, record, rank);
    leaderboard.position.set(cx - CARD_WIDTH / 2, cursorY);
    this.container.addChild(leaderboard);
    cursorY += this.leaderboardHeight(top.length) + 28;

    const replay = (): void => {
      playSfx('ui.click');
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new ArenaScene(this.input.character), ctx);
      });
    };
    const backToTitle = (): void => {
      playSfx('ui.click');
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      });
    };

    const replayBtn = this.makeButton(
      t('survival.summary.replay'),
      { fill: 0x4a6a3a, stroke: 0x8fc060 },
      replay,
    );
    replayBtn.position.set(cx, cursorY + BTN_HEIGHT / 2);
    this.container.addChild(replayBtn);
    cursorY += BTN_HEIGHT + BTN_GAP;

    const titleBtn = this.makeButton(
      t('survival.backToTitle'),
      { fill: 0x2a2a36, stroke: 0xa08050 },
      backToTitle,
    );
    titleBtn.position.set(cx, cursorY + BTN_HEIGHT / 2);
    this.container.addChild(titleBtn);

    ctx.app.stage.addChild(this.container);

    // Keyboard convenience: R = replay, Esc = back to title.
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'r' || e.key === 'R') replay();
      else if (e.key === 'Escape') backToTitle();
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

  private makeRecordBanner(rank: number): Container {
    const c = new Container({ label: 'record-banner' });
    const w = CARD_WIDTH;
    const h = 36;
    const bg = new Graphics()
      .roundRect(-w / 2, 0, w, h, 8)
      .fill({ color: COLOR_RECORD_BANNER, alpha: 0.95 })
      .stroke({ width: 2, color: COLOR_HIGHLIGHT, alpha: 0.95 });
    const label = new Text({
      text: `${t('survival.summary.newRecord')}  ${t('survival.summary.rank', { n: rank + 1 })}`,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        fill: COLOR_TITLE,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5, 0.5);
    label.position.set(0, h / 2);
    c.addChild(bg, label);
    return c;
  }

  /** Celebratory banner for a freshly-unlocked character. Same
   *  geometry as the high-score banner but tinted with the
   *  rare-pip gold so the player notices it's a different reward. */
  private makeUnlockBanner(id: CharacterId): Container {
    const c = new Container({ label: 'unlock-banner' });
    const w = CARD_WIDTH;
    const h = 36;
    const bg = new Graphics()
      .roundRect(-w / 2, 0, w, h, 8)
      .fill({ color: 0x3a5d2a, alpha: 0.95 })
      .stroke({ width: 2, color: COLOR_HIGHLIGHT, alpha: 0.95 });
    const def = CHARACTERS[id];
    const name = def ? t(def.displayNameKey) : id;
    const label = new Text({
      text: t('survival.summary.unlocked', { name }),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 16,
        fill: COLOR_TITLE,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5, 0.5);
    label.position.set(0, h / 2);
    c.addChild(bg, label);
    return c;
  }

  private makeStatsCard(): Container {
    const c = new Container({ label: 'stats-card' });
    const h = this.statsCardHeight();
    const bg = new Graphics()
      .roundRect(0, 0, CARD_WIDTH, h, 10)
      .fill({ color: COLOR_CARD, alpha: 0.92 })
      .stroke({ width: 2, color: COLOR_CARD_STROKE, alpha: 0.85 });
    c.addChild(bg);

    const rows: Array<[string, string]> = [
      [t('survival.summary.time'), formatDuration(this.input.ms)],
      [t('survival.summary.wave'), String(this.input.wave)],
      [t('survival.summary.kills'), String(this.input.kills)],
      [t('survival.summary.level'), String(this.input.level)],
    ];
    const padX = 18;
    let rowY = 16;
    for (const [label, value] of rows) {
      const lbl = new Text({
        text: label,
        style: { fontFamily: 'system-ui, sans-serif', fontSize: 16, fill: COLOR_LABEL },
      });
      lbl.position.set(padX, rowY);
      const val = new Text({
        text: value,
        style: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: 18,
          fill: COLOR_VALUE,
          fontWeight: 'bold',
        },
      });
      val.anchor.set(1, 0);
      val.position.set(CARD_WIDTH - padX, rowY - 1);
      c.addChild(lbl, val);
      rowY += ROW_GAP;
    }
    return c;
  }

  private statsCardHeight(): number {
    // 4 rows + top/bottom padding.
    return 16 + ROW_GAP * 4 + 4;
  }

  private makeLeaderboard(
    top: ReadonlyArray<SurvivalRunRecord>,
    submitted: SurvivalRunRecord,
    rank: number,
  ): Container {
    const c = new Container({ label: 'leaderboard' });
    const h = this.leaderboardHeight(top.length);
    const bg = new Graphics()
      .roundRect(0, 0, CARD_WIDTH, h, 10)
      .fill({ color: COLOR_CARD, alpha: 0.92 })
      .stroke({ width: 2, color: COLOR_CARD_STROKE, alpha: 0.85 });
    c.addChild(bg);

    const header = new Text({
      text: t('survival.summary.topScores'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fill: COLOR_LABEL,
        fontWeight: 'bold',
      },
    });
    header.position.set(18, 12);
    c.addChild(header);

    if (top.length === 0) {
      const empty = new Text({
        text: t('survival.summary.noScores'),
        style: { fontFamily: 'system-ui, sans-serif', fontSize: 16, fill: COLOR_VALUE },
      });
      empty.anchor.set(0.5, 0);
      empty.position.set(CARD_WIDTH / 2, 40);
      c.addChild(empty);
      return c;
    }

    let rowY = 38;
    for (let i = 0; i < top.length; i++) {
      const r = top[i]!;
      const isCurrent = rank === i && r.savedAtMs === submitted.savedAtMs && r.ms === submitted.ms;
      const colour = isCurrent ? COLOR_HIGHLIGHT : COLOR_VALUE;
      const line = new Text({
        text: `${i + 1}.  ${formatDuration(r.ms)}  ·  V${r.wave}  ·  ${r.kills} ${t('survival.summary.kills').toLowerCase()}`,
        style: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          fill: colour,
          fontWeight: isCurrent ? 'bold' : 'normal',
        },
      });
      line.position.set(18, rowY);
      c.addChild(line);
      rowY += SCORES_GAP;
    }
    return c;
  }

  private leaderboardHeight(rowCount: number): number {
    // 38 px header gap + N rows + bottom padding.
    const rows = Math.max(1, rowCount);
    return 38 + rows * SCORES_GAP + 6;
  }

  private makeButton(
    label: string,
    colours: { fill: number; stroke: number },
    onTap: () => void,
  ): Container {
    const container = new Container({ label: `summary-btn-${label}` });
    const bg = new Graphics()
      .roundRect(-BTN_WIDTH / 2, -BTN_HEIGHT / 2, BTN_WIDTH, BTN_HEIGHT, 8)
      .fill({ color: colours.fill, alpha: 0.95 })
      .stroke({ width: 3, color: colours.stroke, alpha: 0.9 });
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fill: COLOR_TITLE,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    container.addChild(bg, text);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', (e) => {
      e.stopPropagation();
      onTap();
    });
    return container;
  }
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
