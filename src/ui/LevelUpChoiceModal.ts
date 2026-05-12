import type { Application, FederatedPointerEvent } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { t } from '@services/I18nService';
import { SafeArea } from '@services/SafeArea';
import { UPGRADES, type UpgradeKind } from '@data/upgrades';

const BACKDROP_COLOR = 0x000814;
const BACKDROP_ALPHA = 0.78;
const CARD_BG = 0x1c2840;
const CARD_STROKE = 0xa08050;
const CARD_PRESSED_BG = 0x2c3a52;
const TITLE_COLOR = 0xfaf6e8;
const SUBTITLE_COLOR = 0xa9b3c7;
const CARD_NAME_COLOR = 0xfaf6e8;
const CARD_DESC_COLOR = 0xc4cad6;
const CARD_GAP = 12;
const CARD_HEIGHT = 78;
const CARD_PADDING_X = 16;
const CARD_PIP_SIZE = 46;
const CARD_PIP_GAP = 16;
const MODAL_MARGIN_X = 16;
const MODAL_MAX_WIDTH = 360;
const SUBTITLE_GAP = 8;
const HEADER_TO_CARDS_GAP = 24;

export type LevelUpPickHandler = (kind: UpgradeKind) => void;

/**
 * Vampire-Survivors-style choice modal. Survival mode opens this after
 * each player level-up: the simulation is paused (the scene gates its
 * own update + the controller's update reads `isOpen` via GameplayUI's
 * pause hooks), the player taps one of three cards, the scene applies
 * the upgrade and closes the modal.
 *
 * UI-only: no game state owned here. The scene picks the candidate
 * upgrades via `rollUpgradeChoices` and feeds them in via `open()`,
 * and gets the picked kind back through the `LevelUpPickHandler`
 * callback.
 *
 * Mobile-first layout: 3 cards stacked vertically, full-width up to
 * 360 px, centred horizontally + vertically with safe-area-aware
 * padding so the title clears the iPhone Dynamic Island and the
 * bottom row clears the home indicator.
 */
export class LevelUpChoiceModal {
  readonly container: Container;
  private readonly app: Application;
  private readonly backdrop: Graphics;
  private readonly title: Text;
  private readonly subtitle: Text;
  private cards: Container[] = [];
  private pickHandler: LevelUpPickHandler | null = null;
  private opened = false;
  private readonly onResize: () => void;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container({ label: 'levelup-choice-modal' });
    this.container.visible = false;
    // Block all pointer events from bleeding through to the world. The
    // backdrop is eventMode:'static' and stops propagation in its own
    // pointertap so a stray tap outside the cards doesn't close the
    // modal or trigger a world click.
    this.container.eventMode = 'static';

    this.backdrop = new Graphics();
    this.backdrop.eventMode = 'static';
    this.backdrop.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
    });
    this.container.addChild(this.backdrop);

    this.title = new Text({
      text: t('survival.levelup.title'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 28,
        fill: TITLE_COLOR,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.title.anchor.set(0.5, 0);

    this.subtitle = new Text({
      text: t('survival.levelup.subtitle'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        fill: SUBTITLE_COLOR,
        fontStyle: 'italic',
      },
    });
    this.subtitle.anchor.set(0.5, 0);

    this.container.addChild(this.title, this.subtitle);

    this.onResize = (): void => this.paintBackdrop();
    this.paintBackdrop();
    app.renderer.on('resize', this.onResize);
  }

  get isOpen(): boolean {
    return this.opened;
  }

  /** Re-paint the dim layer + recompute card geometry for the current
   *  screen size. Called on construction and on every renderer resize.
   *  Also re-rendered each time the modal opens so card dimensions
   *  match the current orientation. */
  private paintBackdrop(): void {
    this.backdrop
      .clear()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: BACKDROP_COLOR, alpha: BACKDROP_ALPHA });
  }

  open(choices: ReadonlyArray<UpgradeKind>, onPick: LevelUpPickHandler): void {
    this.pickHandler = onPick;
    this.opened = true;
    this.container.visible = true;
    this.disposeCards();
    this.paintBackdrop();

    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;
    const cardW = Math.min(MODAL_MAX_WIDTH, screenW - MODAL_MARGIN_X * 2);
    const stackHeight = choices.length * CARD_HEIGHT + (choices.length - 1) * CARD_GAP;
    const totalHeight =
      this.title.height + SUBTITLE_GAP + this.subtitle.height + HEADER_TO_CARDS_GAP + stackHeight;

    // Center vertically, biased slightly upward so the cards sit in
    // the comfortable thumb-reach band on portrait phones.
    const topPadding = Math.max(SafeArea.top + 24, (screenH - totalHeight) / 2 - 40);
    const cx = screenW / 2;

    this.title.position.set(cx, topPadding);
    this.subtitle.position.set(cx, topPadding + this.title.height + SUBTITLE_GAP);
    const cardsTop =
      topPadding + this.title.height + SUBTITLE_GAP + this.subtitle.height + HEADER_TO_CARDS_GAP;

    for (let i = 0; i < choices.length; i++) {
      const kind = choices[i]!;
      const card = this.buildCard(kind, cardW);
      card.position.set(cx - cardW / 2, cardsTop + i * (CARD_HEIGHT + CARD_GAP));
      this.container.addChild(card);
      this.cards.push(card);
    }
  }

  close(): void {
    this.opened = false;
    this.container.visible = false;
    this.pickHandler = null;
    this.disposeCards();
  }

  destroy(): void {
    this.app.renderer.off('resize', this.onResize);
    this.disposeCards();
    this.container.destroy({ children: true });
  }

  private disposeCards(): void {
    for (const card of this.cards) {
      this.container.removeChild(card);
      card.destroy({ children: true });
    }
    this.cards.length = 0;
  }

  private buildCard(kind: UpgradeKind, width: number): Container {
    const def = UPGRADES[kind];
    const card = new Container({ label: `levelup-card-${kind}` });

    const bg = new Graphics()
      .roundRect(0, 0, width, CARD_HEIGHT, 10)
      .fill({ color: CARD_BG, alpha: 0.95 })
      .stroke({ width: 2, color: CARD_STROKE, alpha: 0.9 });
    card.addChild(bg);

    // Rarity pip — colour-coded square on the left.
    const pipY = (CARD_HEIGHT - CARD_PIP_SIZE) / 2;
    const pip = new Graphics()
      .roundRect(CARD_PADDING_X, pipY, CARD_PIP_SIZE, CARD_PIP_SIZE, 6)
      .fill({ color: def.pipColor, alpha: 0.95 })
      .stroke({ width: 2, color: 0x000000, alpha: 0.4 });
    // Letter glyph inside the pip (no icon assets in v1 — first letter
    // of the upgrade kind is readable enough as a temp visual cue).
    const pipLabel = new Text({
      text: kind.charAt(0).toUpperCase(),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 26,
        fill: 0x1a1a1f,
        fontWeight: 'bold',
      },
    });
    pipLabel.anchor.set(0.5);
    pipLabel.position.set(CARD_PADDING_X + CARD_PIP_SIZE / 2, pipY + CARD_PIP_SIZE / 2);
    card.addChild(pip, pipLabel);

    const textX = CARD_PADDING_X + CARD_PIP_SIZE + CARD_PIP_GAP;
    const textW = width - textX - CARD_PADDING_X;
    const name = new Text({
      text: t(def.nameKey, def.args ?? {}),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 17,
        fill: CARD_NAME_COLOR,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: textW,
      },
    });
    name.position.set(textX, 14);
    const desc = new Text({
      text: t(def.descKey, def.args ?? {}),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fill: CARD_DESC_COLOR,
        wordWrap: true,
        wordWrapWidth: textW,
      },
    });
    desc.position.set(textX, 40);
    card.addChild(name, desc);

    card.eventMode = 'static';
    card.cursor = 'pointer';
    // Visual press-down feedback so taps feel responsive on mobile.
    card.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      bg.clear()
        .roundRect(0, 0, width, CARD_HEIGHT, 10)
        .fill({ color: CARD_PRESSED_BG, alpha: 0.95 })
        .stroke({ width: 2, color: CARD_STROKE, alpha: 1 });
    });
    card.on('pointerupoutside', () => {
      bg.clear()
        .roundRect(0, 0, width, CARD_HEIGHT, 10)
        .fill({ color: CARD_BG, alpha: 0.95 })
        .stroke({ width: 2, color: CARD_STROKE, alpha: 0.9 });
    });
    card.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      const handler = this.pickHandler;
      if (handler) handler(kind);
    });
    return card;
  }
}
