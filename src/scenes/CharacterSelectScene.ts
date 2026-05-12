import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { playSfx } from '@services/AudioManager';
import { AssetManager } from '@services/AssetManager';
import { SafeArea } from '@services/SafeArea';
import {
  ARCHETYPE_ORDER,
  ARCHETYPES,
  AVATARS_BY_ARCHETYPE,
  type ArchetypeId,
  type CharacterAvatar,
  type DragoonArchetype,
} from '@data/characters';
import { UnlockManager, UNLOCK_HINT_KEYS } from '@services/UnlockManager';
import { ArenaScene } from './Arena/ArenaScene';
import { TitleScene } from './TitleScene';

const BG_COLOR = 0x0e1a28;
const TITLE_COLOR = 0xfaf6e8;
const SUBTITLE_COLOR = 0xa9b3c7;
const CARD_BG = 0x1c2840;
const CARD_STROKE = 0xa08050;
const CARD_PRESSED_BG = 0x2c3a52;
const CARD_NAME_COLOR = 0xfaf6e8;
const CARD_DESC_COLOR = 0xc4cad6;
const CARD_RANGED_TINT = 0x5fa8e8;
const CARD_MELEE_TINT = 0xff9966;
const CARD_SKINS_TINT = 0xeec040;

const CARD_HEIGHT = 132;
const CARD_GAP = 14;
const CARD_MAX_WIDTH = 360;
const CARD_PADDING_X = 16;
const PORTRAIT_SIZE = 96;
const BTN_HEIGHT = 48;
const BTN_WIDTH = 200;
const HEADER_GAP = 28;
const TITLE_FONT_SIZE = 28;
const SUBTITLE_FONT_SIZE = 14;

/** Drag-scroll threshold — when a pointer-down travels more than
 *  this many world-px, the gesture is reclassified as a scroll
 *  and the card's tap-pick is suppressed. */
const SCROLL_DRAG_THRESHOLD_PX = 8;

/** Background tint per element — drives the small element badge on
 *  each archetype card. Lifted from the TLoD UI palette. */
const ELEMENT_COLORS: Record<string, number> = {
  fire: 0xd84a2a,
  water: 0x4a9be4,
  wind: 0x6ec060,
  earth: 0xc09030,
  thunder: 0xa86adf,
  light: 0xf6e6a8,
  darkness: 0x5a3a72,
  divine: 0xffffff,
};

/**
 * Pre-run character picker, 2-tier on archetype → avatar.
 *
 * Top view: 7 cards, one per Dragoon archetype. Each card shows
 * the "visage" avatar's portrait, the archetype name, element +
 * pattern badges, and a skin-count chip ("2 skins" / "1/3 skins").
 *
 * Tap behaviour:
 *   - archetype with 1 unlocked avatar → launch the arena
 *     directly with that avatar (skip the sub-modal).
 *   - archetype with ≥2 unlocked avatars → open the avatar
 *     sub-modal listing every avatar of the archetype (locked
 *     ones rendered with their unlock hint).
 *   - archetype with 0 unlocked avatars → show the easiest-
 *     avatar unlock hint inline; tap is a no-op.
 *
 * Both views share the same drag-scroll viewport so > 5-7 cards
 * fit on a portrait phone (iPhone 14 Pro ≈ 932 logical px).
 */
export class CharacterSelectScene implements Scene {
  readonly name = 'character-select';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;
  /** Current view's scroll container. Re-built on view transition. */
  private cardsContainer: Container | null = null;
  private scrollMask: Graphics | null = null;
  // Drag-scroll state — captured on pointerdown over the scroll
  // viewport, drained on pointerup.
  private dragStartY: number | null = null;
  private dragStartContainerY = 0;
  private scrollMinY = 0;
  private didScrollSinceDown = false;
  /** Current view. The Back button's behaviour depends on this:
   *  in 'archetypes' mode it returns to the title; in 'submodal'
   *  mode it falls back to 'archetypes'. */
  private viewState: { kind: 'archetypes' } | { kind: 'submodal'; archetypeId: ArchetypeId } = {
    kind: 'archetypes',
  };

  enter(ctx: GameContext): void {
    this.container = new Container({ label: 'character-select-scene' });
    this.container.addChild(
      new Graphics().rect(0, 0, ctx.app.screen.width, ctx.app.screen.height).fill(BG_COLOR),
    );
    ctx.app.stage.addChild(this.container);

    this.renderArchetypeView(ctx);

    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      playSfx('ui.click');
      this.handleBack(ctx);
    };
    window.addEventListener('keydown', onKey);
    this.cleanupKey = (): void => window.removeEventListener('keydown', onKey);
  }

  exit(ctx: GameContext): void {
    this.cleanupKey?.();
    this.cleanupKey = null;
    this.cardsContainer = null;
    this.scrollMask = null;
    if (this.container) {
      ctx.app.stage.removeChild(this.container);
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  update(): void {}

  // ---------------------------------------------------------------
  // View transitions
  // ---------------------------------------------------------------

  private handleBack(ctx: GameContext): void {
    if (this.viewState.kind === 'submodal') {
      // Submodal → back to archetype list.
      this.renderArchetypeView(ctx);
    } else {
      // Top view → back to title.
      queueMicrotask(() => void ctx.scenes.switchTo(new TitleScene(), ctx));
    }
  }

  /** Tear down whatever child views are currently mounted (cards
   *  container, back button, title, subtitle, scroll mask) so the
   *  next render starts on a clean slate. The background fill at
   *  z=0 stays put. */
  private clearViewChildren(): void {
    if (!this.container) return;
    // Keep the very first child (background fill). Destroy the rest.
    const bg = this.container.children[0];
    while (this.container.children.length > 1) {
      const child = this.container.children[this.container.children.length - 1]!;
      this.container.removeChild(child);
      child.destroy({ children: true });
    }
    if (bg) this.container.addChildAt(bg, 0);
    this.cardsContainer = null;
    this.scrollMask = null;
    this.dragStartY = null;
    this.didScrollSinceDown = false;
  }

  // ---------------------------------------------------------------
  // Top view — archetype cards
  // ---------------------------------------------------------------

  private renderArchetypeView(ctx: GameContext): void {
    this.viewState = { kind: 'archetypes' };
    this.clearViewChildren();
    if (!this.container) return;
    const { width: screenW, height: screenH } = ctx.app.screen;
    const cx = screenW / 2;

    const headerBottomY = this.renderHeader(
      cx,
      t('characterSelect.title'),
      t('characterSelect.subtitle'),
    );
    const { scrollTop, scrollBottom } = this.computeScrollBounds(headerBottomY, screenH);
    const cardW = Math.min(CARD_MAX_WIDTH, screenW - 32);

    // Build one archetype card per entry in ARCHETYPE_ORDER. The
    // tap handler decides whether to launch directly (1 unlock) or
    // open the sub-modal (2+ unlocks) — locked archetypes (0
    // unlocks) tap to no-op.
    const cards: Container[] = [];
    let cardsCursorY = 0;
    for (const archId of ARCHETYPE_ORDER) {
      const archetype = ARCHETYPES[archId];
      const avatars = AVATARS_BY_ARCHETYPE[archId];
      if (!archetype || avatars.length === 0) continue;
      const unlockedAvatars = avatars.filter((a) => UnlockManager.isUnlocked(a.id));
      const visageAvatar = unlockedAvatars[0] ?? avatars[0]!;
      const card = this.buildArchetypeCard(
        archetype,
        visageAvatar,
        unlockedAvatars,
        avatars,
        cardW,
        () => {
          if (this.didScrollSinceDown) return;
          if (unlockedAvatars.length === 0) {
            // Locked — no-op for now. The card's blurb already
            // surfaces the easiest unlock hint.
            return;
          }
          if (unlockedAvatars.length === 1) {
            playSfx('ui.click');
            const picked = unlockedAvatars[0]!;
            queueMicrotask(() => void ctx.scenes.switchTo(new ArenaScene(picked), ctx));
            return;
          }
          playSfx('ui.click');
          this.renderSubmodalView(ctx, archId);
        },
      );
      card.position.set(cx - cardW / 2, cardsCursorY);
      cards.push(card);
      cardsCursorY += CARD_HEIGHT + CARD_GAP;
    }
    const contentHeight = Math.max(0, cardsCursorY - CARD_GAP);

    this.mountScrollContainer(cards, scrollTop, scrollBottom, contentHeight, screenW);

    const backBtn = this.buildBackButton(() => {
      playSfx('ui.click');
      this.handleBack(ctx);
    });
    backBtn.position.set(cx, screenH - SafeArea.bottom - 12 - BTN_HEIGHT / 2);
    this.container.addChild(backBtn);
  }

  // ---------------------------------------------------------------
  // Sub-modal — avatar list for one archetype
  // ---------------------------------------------------------------

  private renderSubmodalView(ctx: GameContext, archetypeId: ArchetypeId): void {
    this.viewState = { kind: 'submodal', archetypeId };
    this.clearViewChildren();
    if (!this.container) return;
    const { width: screenW, height: screenH } = ctx.app.screen;
    const cx = screenW / 2;
    const archetype = ARCHETYPES[archetypeId];
    const avatars = AVATARS_BY_ARCHETYPE[archetypeId];

    // Sub-modal header — archetype name as the title, "Skins
    // disponibles" as the subtitle (i18n).
    const headerBottomY = this.renderHeader(
      cx,
      t(`archetype.${archetype.id}.name`),
      t('characterSelect.submodalSubtitle'),
    );
    const { scrollTop, scrollBottom } = this.computeScrollBounds(headerBottomY, screenH);
    const cardW = Math.min(CARD_MAX_WIDTH, screenW - 32);

    const cards: Container[] = [];
    let cardsCursorY = 0;
    for (const avatar of avatars) {
      const unlocked = UnlockManager.isUnlocked(avatar.id);
      const card = this.buildAvatarCard(avatar, cardW, unlocked, (picked) => {
        if (!unlocked) return;
        if (this.didScrollSinceDown) return;
        playSfx('ui.click');
        queueMicrotask(() => void ctx.scenes.switchTo(new ArenaScene(picked), ctx));
      });
      card.position.set(cx - cardW / 2, cardsCursorY);
      cards.push(card);
      cardsCursorY += CARD_HEIGHT + CARD_GAP;
    }
    const contentHeight = Math.max(0, cardsCursorY - CARD_GAP);
    this.mountScrollContainer(cards, scrollTop, scrollBottom, contentHeight, screenW);

    const backBtn = this.buildBackButton(() => {
      playSfx('ui.click');
      this.handleBack(ctx);
    });
    backBtn.position.set(cx, screenH - SafeArea.bottom - 12 - BTN_HEIGHT / 2);
    this.container.addChild(backBtn);
  }

  // ---------------------------------------------------------------
  // Layout helpers
  // ---------------------------------------------------------------

  /** Render title + subtitle anchored to the top safe-area. Returns
   *  the bottom Y of the header block so the caller can position
   *  the scroll viewport below it. */
  private renderHeader(cx: number, titleText: string, subtitleText: string): number {
    if (!this.container) return 0;
    let cursorY = 40 + SafeArea.top;

    const title = new Text({
      text: titleText,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: TITLE_FONT_SIZE,
        fill: TITLE_COLOR,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(cx, cursorY);
    this.container.addChild(title);
    cursorY += TITLE_FONT_SIZE + 6;

    const subtitle = new Text({
      text: subtitleText,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: SUBTITLE_FONT_SIZE,
        fill: SUBTITLE_COLOR,
        fontStyle: 'italic',
      },
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.position.set(cx, cursorY);
    this.container.addChild(subtitle);
    cursorY += SUBTITLE_FONT_SIZE + HEADER_GAP;

    return cursorY;
  }

  private computeScrollBounds(
    headerBottomY: number,
    screenH: number,
  ): { scrollTop: number; scrollBottom: number } {
    const backBtnReservedHeight = BTN_HEIGHT + 24 + SafeArea.bottom;
    return {
      scrollTop: headerBottomY,
      scrollBottom: screenH - backBtnReservedHeight,
    };
  }

  /** Pack the given cards into a scrollable container with a mask
   *  + drag handlers. Identical for both views — the only
   *  difference between views is which cards are passed in. */
  private mountScrollContainer(
    cards: Container[],
    scrollTop: number,
    scrollBottom: number,
    contentHeight: number,
    screenW: number,
  ): void {
    if (!this.container) return;
    const scrollViewportHeight = Math.max(0, scrollBottom - scrollTop);

    this.cardsContainer = new Container({ label: 'character-select-cards' });
    this.cardsContainer.position.set(0, scrollTop);
    for (const card of cards) this.cardsContainer.addChild(card);

    this.scrollMask = new Graphics()
      .rect(0, scrollTop, screenW, scrollViewportHeight)
      .fill(0xffffff);
    this.container.addChild(this.scrollMask);
    this.cardsContainer.mask = this.scrollMask;
    this.container.addChild(this.cardsContainer);

    this.scrollMinY = Math.min(0, scrollViewportHeight - contentHeight);
    this.wireScroll(scrollTop, scrollBottom);
  }

  /** Drag-scroll handlers on the root container. Pointers starting
   *  outside the scroll viewport's Y range are ignored so taps on
   *  the back button + the header don't engage the drag state. */
  private wireScroll(top: number, bottom: number): void {
    if (!this.container || !this.cardsContainer) return;
    if (this.scrollMinY === 0) return; // content fits — nothing to scroll

    this.container.eventMode = 'static';

    const onDown = (e: FederatedPointerEvent): void => {
      if (e.global.y < top || e.global.y > bottom) return;
      this.dragStartY = e.global.y;
      this.dragStartContainerY = this.cardsContainer?.y ?? 0;
      this.didScrollSinceDown = false;
    };
    const onMove = (e: FederatedPointerEvent): void => {
      if (this.dragStartY === null || !this.cardsContainer) return;
      const delta = e.global.y - this.dragStartY;
      if (Math.abs(delta) > SCROLL_DRAG_THRESHOLD_PX) {
        this.didScrollSinceDown = true;
      }
      const next = Math.max(top + this.scrollMinY, Math.min(top, this.dragStartContainerY + delta));
      this.cardsContainer.y = next;
    };
    const onUp = (): void => {
      this.dragStartY = null;
    };
    this.container.on('pointerdown', onDown);
    this.container.on('pointermove', onMove);
    this.container.on('pointerup', onUp);
    this.container.on('pointerupoutside', onUp);
  }

  // ---------------------------------------------------------------
  // Card builders
  // ---------------------------------------------------------------

  private buildArchetypeCard(
    archetype: DragoonArchetype,
    visageAvatar: CharacterAvatar,
    unlockedAvatars: ReadonlyArray<CharacterAvatar>,
    allAvatars: ReadonlyArray<CharacterAvatar>,
    width: number,
    onPick: () => void,
  ): Container {
    const isLocked = unlockedAvatars.length === 0;
    const card = new Container({ label: `archetype-card-${archetype.id}` });
    const { bg, redrawBg } = this.makeCardBackground(width, !isLocked);
    card.addChild(bg);
    if (isLocked) card.alpha = 0.65;

    // Portrait — the visage avatar's idle texture.
    this.addPortrait(card, visageAvatar);

    const textX = CARD_PADDING_X + PORTRAIT_SIZE + 16;
    const textW = width - textX - CARD_PADDING_X;

    // Archetype name (large).
    const name = new Text({
      text: t(`archetype.${archetype.id}.name`),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 20,
        fill: CARD_NAME_COLOR,
        fontWeight: 'bold',
      },
    });
    name.position.set(textX, 14);
    card.addChild(name);

    // Element + pattern + skin-count badges on one row.
    const elementColor = ELEMENT_COLORS[archetype.element] ?? 0xa9b3c7;
    const elementBadge = new Text({
      text: t(`element.${archetype.element}`),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fill: elementColor,
        fontWeight: 'bold',
      },
    });
    elementBadge.position.set(textX, 44);
    card.addChild(elementBadge);

    const patternTint = archetype.attackPattern === 'ranged' ? CARD_RANGED_TINT : CARD_MELEE_TINT;
    const patternBadge = new Text({
      text: ' · ' + t(`characterSelect.pattern.${archetype.attackPattern}`),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fill: patternTint,
        fontWeight: 'bold',
      },
    });
    patternBadge.position.set(textX + elementBadge.width, 44);
    card.addChild(patternBadge);

    // Skin count chip — gold when avatars are available, red-grey
    // when locked. Plural-aware via the i18n key suffix.
    const totalAvatars = allAvatars.length;
    const unlockedCount = unlockedAvatars.length;
    let countLabel: string;
    if (isLocked) {
      // Locked: surface the easiest unlock hint (first avatar's).
      const first = allAvatars[0]!;
      const hintKey = UNLOCK_HINT_KEYS[first.id];
      countLabel = hintKey ? t(hintKey) : t('characterSelect.locked');
    } else if (totalAvatars === 1) {
      countLabel = t('characterSelect.skinCount', { n: 1 });
    } else {
      const labelKey =
        unlockedCount > 1 ? 'characterSelect.skinCountPlural' : 'characterSelect.skinCount';
      countLabel = `${t(labelKey, { n: unlockedCount })} / ${totalAvatars}`;
    }
    const skinChip = new Text({
      text: countLabel,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fill: isLocked ? 0xeec040 : CARD_SKINS_TINT,
        fontStyle: isLocked ? 'italic' : 'normal',
        wordWrap: true,
        wordWrapWidth: textW,
      },
    });
    skinChip.position.set(textX, 70);
    card.addChild(skinChip);

    this.wireCardTap(card, redrawBg, width, !isLocked, onPick);
    return card;
  }

  private buildAvatarCard(
    avatar: CharacterAvatar,
    width: number,
    unlocked: boolean,
    onPick: (avatar: CharacterAvatar) => void,
  ): Container {
    const card = new Container({ label: `avatar-card-${avatar.id}` });
    const { bg, redrawBg } = this.makeCardBackground(width, unlocked);
    card.addChild(bg);
    if (!unlocked) card.alpha = 0.65;

    this.addPortrait(card, avatar);

    const textX = CARD_PADDING_X + PORTRAIT_SIZE + 16;
    const textW = width - textX - CARD_PADDING_X;

    const name = new Text({
      text: t(avatar.displayNameKey),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fill: CARD_NAME_COLOR,
        fontWeight: 'bold',
      },
    });
    name.position.set(textX, 16);
    card.addChild(name);

    // Sub-modal cards still show the per-avatar blurb (each
    // skin has its own flavour text). Locked ones swap in the
    // unlock hint.
    const blurbText = unlocked
      ? t(`characterSelect.blurb.${avatar.id}`)
      : UNLOCK_HINT_KEYS[avatar.id]
        ? t(UNLOCK_HINT_KEYS[avatar.id]!)
        : t('characterSelect.locked');
    const blurb = new Text({
      text: blurbText,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        fill: unlocked ? CARD_DESC_COLOR : 0xeec040,
        fontStyle: unlocked ? 'normal' : 'italic',
        wordWrap: true,
        wordWrapWidth: textW,
      },
    });
    blurb.position.set(textX, 50);
    card.addChild(blurb);

    this.wireCardTap(card, redrawBg, width, unlocked, () => onPick(avatar));
    return card;
  }

  // ---------------------------------------------------------------
  // Card primitives (shared by archetype + avatar cards)
  // ---------------------------------------------------------------

  private makeCardBackground(
    width: number,
    unlocked: boolean,
  ): { bg: Graphics; redrawBg: (pressed: boolean) => void } {
    const fill = unlocked ? CARD_BG : 0x10141c;
    const stroke = unlocked ? CARD_STROKE : 0x4a4a52;
    const alpha = unlocked ? 0.95 : 0.8;
    const bg = new Graphics()
      .roundRect(0, 0, width, CARD_HEIGHT, 12)
      .fill({ color: fill, alpha })
      .stroke({ width: 2, color: stroke, alpha });
    const redrawBg = (pressed: boolean): void => {
      const c = pressed ? CARD_PRESSED_BG : fill;
      bg.clear()
        .roundRect(0, 0, width, CARD_HEIGHT, 12)
        .fill({ color: c, alpha: pressed ? 0.95 : alpha })
        .stroke({ width: 2, color: stroke, alpha: pressed ? 1 : alpha });
    };
    return { bg, redrawBg };
  }

  private addPortrait(card: Container, avatar: CharacterAvatar): void {
    const portraitX = CARD_PADDING_X;
    const portraitY = (CARD_HEIGHT - PORTRAIT_SIZE) / 2;
    const portraitBg = new Graphics()
      .roundRect(portraitX, portraitY, PORTRAIT_SIZE, PORTRAIT_SIZE, 8)
      .fill({ color: 0x141a26, alpha: 0.9 })
      .stroke({ width: 1, color: 0x000000, alpha: 0.6 });
    card.addChild(portraitBg);

    const tex = AssetManager.getTexture(avatar.sprite.base.idle);
    if (tex) {
      const portrait = new Sprite(tex);
      const scale = Math.min(PORTRAIT_SIZE / tex.width, PORTRAIT_SIZE / tex.height);
      portrait.scale.set(scale);
      portrait.position.set(
        portraitX + (PORTRAIT_SIZE - tex.width * scale) / 2,
        portraitY + (PORTRAIT_SIZE - tex.height * scale) / 2,
      );
      card.addChild(portrait);
    }
  }

  private wireCardTap(
    card: Container,
    redrawBg: (pressed: boolean) => void,
    _width: number,
    unlocked: boolean,
    onTap: () => void,
  ): void {
    card.eventMode = 'static';
    card.cursor = unlocked ? 'pointer' : 'not-allowed';
    if (unlocked) {
      card.on('pointerdown', () => redrawBg(true));
      card.on('pointerup', () => redrawBg(false));
      card.on('pointerupoutside', () => redrawBg(false));
    }
    card.on('pointertap', (e) => {
      e.stopPropagation();
      onTap();
    });
  }

  private buildBackButton(onTap: () => void): Container {
    const c = new Container({ label: 'character-select-back' });
    const bg = new Graphics()
      .roundRect(-BTN_WIDTH / 2, -BTN_HEIGHT / 2, BTN_WIDTH, BTN_HEIGHT, 8)
      .fill({ color: 0x2a2a36, alpha: 0.95 })
      .stroke({ width: 3, color: 0xa08050, alpha: 0.9 });
    const label = new Text({
      text: t('characterSelect.back'),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 18,
        fill: TITLE_COLOR,
        fontWeight: 'bold',
      },
    });
    label.anchor.set(0.5);
    c.addChild(bg, label);
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.on('pointertap', (e) => {
      e.stopPropagation();
      onTap();
    });
    return c;
  }
}
