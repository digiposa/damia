import { Container, Graphics, Sprite as PixiSprite, Text } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { SaveManager } from '@services/SaveManager';
import { AssetManager } from '@services/AssetManager';
import { playMusic, playSfx, unlockAudio } from '@services/AudioManager';
import { ForestScene } from '@scenes/ForestOfSeles/ForestScene';
import { HellenaScene } from '@scenes/HellenaPrison/HellenaScene';
import { CharacterSelectScene } from '@scenes/CharacterSelectScene';
import { TrainingScene } from '@scenes/Training/TrainingScene';
import { SettingsPanel } from '@ui/SettingsPanel';
import { CodexPanel } from '@ui/CodexPanel';

interface ButtonHandle {
  container: Container;
  setEnabled: (enabled: boolean) => void;
}

/** Sizing knobs for the bottom action stack. Tuned for thumb taps on
 *  portrait mobile while still looking right on desktop. */
const BTN_WIDTH = 280;
const BTN_HEIGHT = 48;
const BTN_GAP = 14;
/** Distance from the screen bottom edge to the first (lowest) button. */
const STACK_BOTTOM_PADDING = 28;
/** Settings gear icon — 28×28 button anchored top-right corner. */
const GEAR_SIZE = 28;
const GEAR_MARGIN = 16;

/**
 * Title screen. Acts as the routing junction for the two game modes:
 *  - Story (Forest / Hellena chain, with save/load via SaveManager).
 *  - Survival (placeholder until the wave-spawner mode lands; the entry
 *    button is wired so we keep the menu shape stable).
 *
 * Buttons stack vertically at the bottom-centre so a single tap finger
 * reaches anything without scrolling and the bg artwork stays visible
 * up top. Continue is greyed out when there's no save.
 */
export class TitleScene implements Scene {
  readonly name = 'title';
  private container: Container | null = null;
  private cleanups: Array<() => void> = [];

  enter(ctx: GameContext): void {
    const { width, height } = ctx.app.screen;
    this.container = new Container({ label: 'title-scene' });

    // Background — TLoD mainscreen image, cover-scaled. Falls back to a
    // flat dark fill if the texture didn't load.
    const bgTex = AssetManager.getTexture('ui.mainscreen');
    if (bgTex) {
      const bg = new PixiSprite(bgTex);
      const cover = Math.max(width / bgTex.width, height / bgTex.height);
      bg.scale.set(cover);
      bg.position.set((width - bgTex.width * cover) / 2, (height - bgTex.height * cover) / 2);
      this.container.addChild(bg);
    } else {
      this.container.addChild(new Graphics().rect(0, 0, width, height).fill(0x0e1814));
    }

    // Project subtitle footer (no big "DAMIA" overlay — bg art already
    // carries the LoD logo).
    const subtitle = new Text({
      text: `${t('title.name')} — ${t('title.subtitle')}`,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fill: 0xc8b58a,
        fontStyle: 'italic',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    subtitle.anchor.set(0.5, 1);
    subtitle.position.set(width / 2, height - 8);

    // Bottom stack: Survival (newest, on top), Continue, New Game (default
    // primary, sits at the bottom = closest to the thumb).
    const stackBottomY = height - STACK_BOTTOM_PADDING - BTN_HEIGHT / 2;

    const newGameBtn = this.makeButton(
      `${t('title.modeStory')} — ${t('title.newGame')}`,
      width / 2,
      stackBottomY,
      () => {
        playSfx('ui.click');
        SaveManager.clear();
        void ctx.scenes.switchTo(new ForestScene(), ctx);
      },
    );

    const continueBtn = this.makeButton(
      `${t('title.modeStory')} — ${t('title.continue')}`,
      width / 2,
      stackBottomY - (BTN_HEIGHT + BTN_GAP),
      () => {
        const save = SaveManager.load();
        if (!save) return;
        playSfx('ui.click');
        // Route Continue back to whichever zone was active at save time.
        const next: Scene =
          save.currentZoneId === 'hellena' ? new HellenaScene(save) : new ForestScene(save);
        void ctx.scenes.switchTo(next, ctx);
      },
    );
    continueBtn.setEnabled(SaveManager.has());

    const survivalBtn = this.makeButton(
      t('title.modeSurvival'),
      width / 2,
      stackBottomY - 2 * (BTN_HEIGHT + BTN_GAP),
      () => {
        playSfx('ui.click');
        void ctx.scenes.switchTo(new CharacterSelectScene(), ctx);
      },
    );

    // Training / Debug sandbox — dev tool, sits at the top of the
    // stack so it's clearly the "out of band" entry. Picks Dart LV1
    // by default; everything tweakable from the in-arena DBG panel.
    const trainingBtn = this.makeButton(
      t('title.modeTraining'),
      width / 2,
      stackBottomY - 3 * (BTN_HEIGHT + BTN_GAP),
      () => {
        playSfx('ui.click');
        void ctx.scenes.switchTo(new TrainingScene(), ctx);
      },
    );

    // Settings overlay (volume / language only — no Resume / Quit-to-Title
    // since we're already on the title and no run is in flight). Hidden
    // until the gear icon is tapped.
    const settings = new SettingsPanel(ctx.app, { showActions: false });
    const codex = new CodexPanel(ctx.app);
    settings.onAction((action) => {
      if (action === 'open-codex') {
        settings.close();
        codex.open();
      }
    });
    const gearIcon = this.makeGearIcon(
      width - GEAR_MARGIN - GEAR_SIZE / 2,
      GEAR_MARGIN + GEAR_SIZE / 2,
      () => settings.open(),
    );

    // Keep the gear pinned to the top-right corner on window resize so
    // a desktop player widening the window doesn't end up with the icon
    // floating in mid-air. Volume / language rows inside the panel
    // already redraw responsively (Modal handles that).
    const onResize = (): void => {
      gearIcon.position.set(
        ctx.app.screen.width - GEAR_MARGIN - GEAR_SIZE / 2,
        GEAR_MARGIN + GEAR_SIZE / 2,
      );
    };
    ctx.app.renderer.on('resize', onResize);
    this.cleanups.push(() => ctx.app.renderer.off('resize', onResize));
    this.cleanups.push(() => settings.destroy());
    this.cleanups.push(() => codex.destroy());

    this.container.addChild(
      subtitle,
      trainingBtn.container,
      survivalBtn.container,
      continueBtn.container,
      newGameBtn.container,
      settings.container,
      codex.container,
      gearIcon,
    );
    ctx.app.stage.addChild(this.container);

    // First user click anywhere unlocks the AudioContext (browser policy)
    // and starts the title music. Re-entering the title later (after game
    // over / quit-to-title) skips the unlock but playMusic is idempotent.
    const startTitleMusic = (): void => playMusic('music.titleScreen');
    const unlock = (): void => {
      unlockAudio();
      startTitleMusic();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    this.cleanups.push(() => window.removeEventListener('pointerdown', unlock));
    startTitleMusic();
  }

  exit(ctx: GameContext): void {
    for (const c of this.cleanups) c();
    this.cleanups.length = 0;
    if (this.container) {
      ctx.app.stage.removeChild(this.container);
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  update(): void {}

  private makeButton(label: string, x: number, y: number, onClick: () => void): ButtonHandle {
    const container = new Container({ label: `btn-${label}` });
    const bg = new Graphics()
      .roundRect(-BTN_WIDTH / 2, -BTN_HEIGHT / 2, BTN_WIDTH, BTN_HEIGHT, 6)
      .fill({ color: 0x202820, alpha: 0.95 })
      .stroke({ width: 2, color: 0xa08050 });
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 18,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    container.addChild(bg, text);
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    let enabled = true;

    container.on('pointertap', () => {
      if (enabled) onClick();
    });
    container.on('pointerover', () => {
      if (enabled) bg.tint = 0xc8b58a;
    });
    container.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return {
      container,
      setEnabled: (e: boolean) => {
        enabled = e;
        container.alpha = e ? 1 : 0.4;
        container.eventMode = e ? 'static' : 'none';
      },
    };
  }

  /**
   * Small rounded-square button with a gear glyph. Same visual language
   * as the bottom-stack action buttons (panel bg, gold border, hover
   * tint) but sized for a single-finger top-corner tap. Anchor is centre
   * so callers can drive position from `(width - margin, margin)` without
   * worrying about the button's own dimensions.
   */
  private makeGearIcon(x: number, y: number, onTap: () => void): Container {
    const container = new Container({ label: 'title-gear' });
    const bg = new Graphics()
      .roundRect(-GEAR_SIZE / 2, -GEAR_SIZE / 2, GEAR_SIZE, GEAR_SIZE, 6)
      .fill({ color: 0x202820, alpha: 0.9 })
      .stroke({ width: 2, color: 0xa08050 });
    const glyph = new Text({
      text: '⚙',
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
      },
    });
    glyph.anchor.set(0.5);
    container.addChild(bg, glyph);
    container.position.set(x, y);
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', () => {
      playSfx('ui.click');
      onTap();
    });
    container.on('pointerover', () => {
      bg.tint = 0xc8b58a;
    });
    container.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    return container;
  }
}
