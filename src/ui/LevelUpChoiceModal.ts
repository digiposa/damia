import type { Application, FederatedPointerEvent } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { t } from '@services/I18nService';
import { SafeArea } from '@services/SafeArea';
import { UPGRADES, type UpgradeKind } from '@data/upgrades';
import { Modal } from './Modal';
import { COLORS, TEXT } from './theme';

const CARD_BG = 0x1c2840;
const CARD_PRESSED_BG = 0x2c3a52;
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
 * Vampire-Survivors-style choice modal. Survival mode opens this
 * after each player level-up: the simulation is paused, the player
 * taps one of three cards, the scene applies the upgrade and closes
 * the modal.
 *
 * Built on the shared Modal base for the dim backdrop + open / close /
 * raise-to-top boilerplate. Card geometry stays manual (cards are
 * absolute-positioned within the modal container so the tap-down
 * press-feedback can repaint the bg in place without disturbing
 * sibling layout). Cards are rebuilt on every open() to match the
 * caller-provided choices.
 */
export class LevelUpChoiceModal extends Modal {
  private readonly title: Text;
  private readonly subtitle: Text;
  private cards: Container[] = [];
  private pickHandler: LevelUpPickHandler | null = null;
  private currentChoices: ReadonlyArray<UpgradeKind> = [];

  constructor(app: Application) {
    super(app, 'levelup-choice-modal');
    this.container.eventMode = 'static';
    // Stop pointer events from bleeding through the dim — the player
    // is forced to make a choice on a card.
    this.dim.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
    });

    this.title = new Text({
      text: t('survival.levelup.title'),
      style: {
        ...TEXT.title,
        fontSize: 28,
        fill: COLORS.textCream,
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.title.anchor.set(0.5, 0);

    this.subtitle = new Text({
      text: t('survival.levelup.subtitle'),
      style: { fill: 0xa9b3c7, fontSize: 14, fontStyle: 'italic' },
    });
    this.subtitle.anchor.set(0.5, 0);

    // Title + subtitle live on the root container (not on the panel)
    // so the modal can position them above the cards via raw x/y.
    this.container.addChild(this.title, this.subtitle);
  }

  /** Override base API so the caller can pass per-open choices. */
  override open(choices?: ReadonlyArray<UpgradeKind>, onPick?: LevelUpPickHandler): void {
    if (choices) this.currentChoices = choices;
    if (onPick) this.pickHandler = onPick;
    super.open();
  }

  protected buildPanel(): Container {
    // The level-up modal doesn't use a single panel container —
    // cards are positioned individually. Return a no-op container
    // that the base can still treat as `panel`. Layout work happens
    // in onOpen() instead.
    return new Container({ label: 'levelup-cards-host' });
  }

  /** Don't apply the default flex sizing — this modal positions
   *  cards manually via screen coordinates. */
  protected override applyPanelSize(): void {
    // Intentionally empty.
  }

  protected override onOpen(): void {
    this.disposeCards();

    const screenW = this.app.screen.width;
    const screenH = this.app.screen.height;
    const cardW = Math.min(MODAL_MAX_WIDTH, screenW - MODAL_MARGIN_X * 2);
    const stackHeight =
      this.currentChoices.length * CARD_HEIGHT + (this.currentChoices.length - 1) * CARD_GAP;
    const totalHeight =
      this.title.height + SUBTITLE_GAP + this.subtitle.height + HEADER_TO_CARDS_GAP + stackHeight;
    const topPadding = Math.max(SafeArea.top + 24, (screenH - totalHeight) / 2 - 40);
    const cx = screenW / 2;

    this.title.position.set(cx, topPadding);
    this.subtitle.position.set(cx, topPadding + this.title.height + SUBTITLE_GAP);
    const cardsTop =
      topPadding + this.title.height + SUBTITLE_GAP + this.subtitle.height + HEADER_TO_CARDS_GAP;

    for (let i = 0; i < this.currentChoices.length; i++) {
      const kind = this.currentChoices[i]!;
      const card = this.buildCard(kind, cardW);
      card.position.set(cx - cardW / 2, cardsTop + i * (CARD_HEIGHT + CARD_GAP));
      this.container.addChild(card);
      this.cards.push(card);
    }
  }

  protected override onClose(): void {
    this.pickHandler = null;
    this.disposeCards();
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
      .stroke({ width: 2, color: COLORS.border, alpha: 0.9 });
    card.addChild(bg);

    // Rarity pip.
    const pipY = (CARD_HEIGHT - CARD_PIP_SIZE) / 2;
    const pip = new Graphics()
      .roundRect(CARD_PADDING_X, pipY, CARD_PIP_SIZE, CARD_PIP_SIZE, 6)
      .fill({ color: def.pipColor, alpha: 0.95 })
      .stroke({ width: 2, color: 0x000000, alpha: 0.4 });
    const pipLabel = new Text({
      text: kind.charAt(0).toUpperCase(),
      style: { fontSize: 26, fill: 0x1a1a1f, fontWeight: 'bold' },
    });
    pipLabel.anchor.set(0.5);
    pipLabel.position.set(CARD_PADDING_X + CARD_PIP_SIZE / 2, pipY + CARD_PIP_SIZE / 2);
    card.addChild(pip, pipLabel);

    const textX = CARD_PADDING_X + CARD_PIP_SIZE + CARD_PIP_GAP;
    const textW = width - textX - CARD_PADDING_X;
    const name = new Text({
      text: t(def.nameKey, def.args ?? {}),
      style: {
        ...TEXT.value,
        fontSize: 17,
        fill: COLORS.textCream,
        wordWrap: true,
        wordWrapWidth: textW,
      },
    });
    name.position.set(textX, 14);
    const desc = new Text({
      text: t(def.descKey, def.args ?? {}),
      style: { fill: 0xc4cad6, fontSize: 13, wordWrap: true, wordWrapWidth: textW },
    });
    desc.position.set(textX, 40);
    card.addChild(name, desc);

    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerdown', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      bg.clear()
        .roundRect(0, 0, width, CARD_HEIGHT, 10)
        .fill({ color: CARD_PRESSED_BG, alpha: 0.95 })
        .stroke({ width: 2, color: COLORS.border, alpha: 1 });
    });
    card.on('pointerupoutside', () => {
      bg.clear()
        .roundRect(0, 0, width, CARD_HEIGHT, 10)
        .fill({ color: CARD_BG, alpha: 0.95 })
        .stroke({ width: 2, color: COLORS.border, alpha: 0.9 });
    });
    card.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      const handler = this.pickHandler;
      if (handler) handler(kind);
    });
    return card;
  }
}
