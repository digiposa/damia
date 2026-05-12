import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import type { GameContext } from '@/Game';
import type { Scene } from './Scene';
import { t } from '@services/I18nService';
import { playSfx } from '@services/AudioManager';
import { AssetManager } from '@services/AssetManager';
import { SafeArea } from '@services/SafeArea';
import { CHARACTERS, type CharacterDef, type CharacterId } from '@data/characters';
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

/** Order in which characters appear in the selector. Future
 *  additions slot in here; locked entries (Round 3) will hide
 *  themselves via the `UnlockManager`. */
/** Display order on the selector — mirrors TLoD's party-join
 *  sequence. The card list will overflow a portrait phone at 9
 *  entries (~1314 px tall vs ~900 px viewport); a follow-up will
 *  add a vertical drag-scroll to the cards container. For now
 *  locked cards still render but require scrolling past the
 *  visible window on mid-size phones. */
const SELECTOR_ORDER: ReadonlyArray<CharacterId> = [
  'dart',
  'lavitz',
  'shana',
  'rose',
  'haschel',
  'albert',
  'meru',
  'kongol',
  'miranda',
];

/**
 * Pre-run character picker for Survival mode. Sits between the
 * title screen's "Survival Mode" CTA and `ArenaScene`. Tapping a
 * card immediately launches the Arena with that character's
 * `CharacterDef` passed through. A "Back" button returns to the
 * title.
 *
 * Layout: vertical stack of cards (mobile-portrait-friendly).
 * Each card has a portrait, the character's display name, an
 * attack-pattern badge (Mêlée / Distance), and a one-line blurb.
 *
 * Round 3 will gate Shana behind a meta-progression unlock; for
 * now both characters are freely selectable.
 */
/** Cards have to bubble pointer events to the scroll container, but if
 *  the user drags more than this many world-px the gesture is reclassified
 *  as a scroll and the tap-pick on the card is cancelled. */
const SCROLL_DRAG_THRESHOLD_PX = 8;

export class CharacterSelectScene implements Scene {
  readonly name = 'character-select';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;
  /** Inner Container holding only the cards. Translated vertically by
   *  the drag handlers; clipped to the scroll viewport by a mask. */
  private cardsContainer: Container | null = null;
  private scrollMask: Graphics | null = null;
  /** Drag state. Captured on pointerdown over the cards area. */
  private dragStartY: number | null = null;
  private dragStartContainerY = 0;
  /** Min Y for the cards container (most-scrolled-down position).
   *  Computed once after layout — 0 when content fits the viewport
   *  so the drag clamps to a no-op. */
  private scrollMinY = 0;
  /** True from the moment a pointerdown exceeds the drag threshold
   *  until the next pointerup. Cards check this in their `pointertap`
   *  to suppress the pick when the gesture was actually a scroll. */
  private didScrollSinceDown = false;

  enter(ctx: GameContext): void {
    const { width: screenW, height: screenH } = ctx.app.screen;
    this.container = new Container({ label: 'character-select-scene' });

    this.container.addChild(new Graphics().rect(0, 0, screenW, screenH).fill(BG_COLOR));

    const cx = screenW / 2;
    let cursorY = 40 + SafeArea.top;

    const title = new Text({
      text: t('characterSelect.title'),
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
      text: t('characterSelect.subtitle'),
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

    // Reserve a band at the bottom of the screen for the Back button
    // (+ safe-area bottom inset). The cards scroll-area spans from
    // `cursorY` to `scrollBottom`. With 9 cards the content height
    // (1314 px at the current dimensions) overflows the viewport on
    // most phones, so this band needs to be scrollable.
    const backBtnReservedHeight = BTN_HEIGHT + 24 + SafeArea.bottom;
    const scrollTop = cursorY;
    const scrollBottom = screenH - backBtnReservedHeight;
    const scrollViewportHeight = Math.max(0, scrollBottom - scrollTop);

    const cardW = Math.min(CARD_MAX_WIDTH, screenW - 32);
    const cards: Container[] = [];
    let cardsCursorY = 0;
    for (const id of SELECTOR_ORDER) {
      const def = CHARACTERS[id];
      if (!def) continue;
      const unlocked = UnlockManager.isUnlocked(id);
      const card = this.buildCard(def, cardW, unlocked, (picked) => {
        if (!unlocked) return;
        // Gesture-classification gate — if the player was scrolling,
        // suppress the pick. Reset on pointerup so the next tap is
        // considered fresh.
        if (this.didScrollSinceDown) return;
        playSfx('ui.click');
        queueMicrotask(() => {
          void ctx.scenes.switchTo(new ArenaScene(picked), ctx);
        });
      });
      card.position.set(cx - cardW / 2, cardsCursorY);
      cards.push(card);
      cardsCursorY += CARD_HEIGHT + CARD_GAP;
    }
    const contentHeight = Math.max(0, cardsCursorY - CARD_GAP);

    // Mount the cards inside a scrollable child container. Mask
    // clips overflow at the scroll viewport boundaries so cards
    // don't bleed into the title or the back button.
    this.cardsContainer = new Container({ label: 'character-select-cards' });
    this.cardsContainer.position.set(0, scrollTop);
    for (const card of cards) this.cardsContainer.addChild(card);

    this.scrollMask = new Graphics()
      .rect(0, scrollTop, screenW, scrollViewportHeight)
      .fill(0xffffff);
    this.container.addChild(this.scrollMask);
    this.cardsContainer.mask = this.scrollMask;
    this.container.addChild(this.cardsContainer);

    // Compute the scroll range. Negative because translating the
    // container UP scrolls the content. When content fits the
    // viewport scrollMinY is 0 → drag handlers turn into no-ops.
    this.scrollMinY = Math.min(0, scrollViewportHeight - contentHeight);
    this.wireScroll(scrollTop, scrollBottom, screenW);

    const backBtn = this.buildBackButton(() => {
      playSfx('ui.click');
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      });
    });
    backBtn.position.set(cx, screenH - SafeArea.bottom - 12 - BTN_HEIGHT / 2);
    this.container.addChild(backBtn);

    ctx.app.stage.addChild(this.container);

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        playSfx('ui.click');
        queueMicrotask(() => {
          void ctx.scenes.switchTo(new TitleScene(), ctx);
        });
      }
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

  /** Attach pointer-drag handlers to the scene's root container so
   *  every child event (cards, back button, gaps between cards)
   *  bubbles into the same scroll classifier. Gestures starting
   *  outside the scroll viewport's Y range are ignored, which keeps
   *  taps on the back button + the title area from arming the drag
   *  state.
   *
   *  The cards' own `pointertap` checks `didScrollSinceDown` to
   *  decide whether to invoke the pick — if the gesture exceeded
   *  the drag threshold, the tap is suppressed. */
  private wireScroll(top: number, bottom: number, _width: number): void {
    if (!this.container || !this.cardsContainer) return;
    if (this.scrollMinY === 0) return; // content fits — nothing to scroll

    // eventMode:'static' on the root container lets it receive
    // bubbled federated events from any descendant.
    this.container.eventMode = 'static';

    const onDown = (e: FederatedPointerEvent): void => {
      // Only engage drag when the gesture starts in the scroll
      // viewport's Y range. Anything above (title / subtitle) or
      // below (back button area) is left untouched.
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
      // top is the absolute viewport-Y where the cards container
      // starts at rest. Translate that base by the drag delta and
      // clamp to [top + scrollMinY, top]. scrollMinY ≤ 0 so the
      // clamp shifts the container UP (negative delta accumulated).
      const next = Math.max(top + this.scrollMinY, Math.min(top, this.dragStartContainerY + delta));
      this.cardsContainer.y = next;
    };
    const onUp = (): void => {
      this.dragStartY = null;
      // didScrollSinceDown stays true through the bubbling
      // pointertap on the card so the pick is suppressed; the next
      // pointerdown resets it (in `onDown` above).
    };
    this.container.on('pointerdown', onDown);
    this.container.on('pointermove', onMove);
    this.container.on('pointerup', onUp);
    this.container.on('pointerupoutside', onUp);
  }

  update(): void {}

  private buildCard(
    def: CharacterDef,
    width: number,
    unlocked: boolean,
    onPick: (def: CharacterDef) => void,
  ): Container {
    const card = new Container({ label: `character-card-${def.id}` });
    // Locked cards render with a desaturated palette so the player
    // can still see who they're working toward but can't confuse
    // the card for a tappable option.
    const fill = unlocked ? CARD_BG : 0x10141c;
    const stroke = unlocked ? CARD_STROKE : 0x4a4a52;
    const alpha = unlocked ? 0.95 : 0.8;
    const bg = new Graphics()
      .roundRect(0, 0, width, CARD_HEIGHT, 12)
      .fill({ color: fill, alpha })
      .stroke({ width: 2, color: stroke, alpha });
    card.addChild(bg);
    if (!unlocked) card.alpha = 0.65;

    // Portrait — uses the character's idle sprite alias scaled into a
    // square slot at the card's left edge. Falls back to a tinted
    // rectangle if the texture failed to load (same fallback strategy
    // as the in-world Sprite component).
    const portraitX = CARD_PADDING_X;
    const portraitY = (CARD_HEIGHT - PORTRAIT_SIZE) / 2;
    const portraitBg = new Graphics()
      .roundRect(portraitX, portraitY, PORTRAIT_SIZE, PORTRAIT_SIZE, 8)
      .fill({ color: 0x141a26, alpha: 0.9 })
      .stroke({ width: 1, color: 0x000000, alpha: 0.6 });
    card.addChild(portraitBg);

    const tex = AssetManager.getTexture(def.sprite.base.idle);
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

    // Right column: name, pattern badge, blurb.
    const textX = portraitX + PORTRAIT_SIZE + 16;
    const textW = width - textX - CARD_PADDING_X;
    const name = new Text({
      text: t(def.displayNameKey),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 22,
        fill: CARD_NAME_COLOR,
        fontWeight: 'bold',
      },
    });
    name.position.set(textX, 16);
    card.addChild(name);

    const patternTint =
      def.archetype.attackPattern === 'ranged' ? CARD_RANGED_TINT : CARD_MELEE_TINT;
    const patternLabel = t(`characterSelect.pattern.${def.archetype.attackPattern}`);
    const badge = new Text({
      text: patternLabel,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        fill: patternTint,
        fontWeight: 'bold',
      },
    });
    badge.position.set(textX, 46);
    card.addChild(badge);

    // Locked cards swap the blurb for the unlock hint so the player
    // knows what to chase. Falls back to a generic "Verrouillé" if
    // the hint key isn't registered yet (defensive — shouldn't
    // happen at the current pool size of 2 characters).
    const blurbText = unlocked
      ? t(`characterSelect.blurb.${def.id}`)
      : UNLOCK_HINT_KEYS[def.id]
        ? t(UNLOCK_HINT_KEYS[def.id]!)
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
    blurb.position.set(textX, 70);
    card.addChild(blurb);

    card.eventMode = 'static';
    card.cursor = unlocked ? 'pointer' : 'not-allowed';
    if (unlocked) {
      card.on('pointerdown', () => {
        bg.clear()
          .roundRect(0, 0, width, CARD_HEIGHT, 12)
          .fill({ color: CARD_PRESSED_BG, alpha: 0.95 })
          .stroke({ width: 2, color: CARD_STROKE, alpha: 1 });
      });
      card.on('pointerupoutside', () => {
        bg.clear()
          .roundRect(0, 0, width, CARD_HEIGHT, 12)
          .fill({ color: CARD_BG, alpha: 0.95 })
          .stroke({ width: 2, color: CARD_STROKE, alpha: 0.9 });
      });
    }
    card.on('pointertap', (e) => {
      e.stopPropagation();
      onPick(def);
    });
    return card;
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
