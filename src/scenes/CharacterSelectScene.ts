import { Container, Graphics, Sprite, Text } from 'pixi.js';
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
export class CharacterSelectScene implements Scene {
  readonly name = 'character-select';
  private container: Container | null = null;
  private cleanupKey: (() => void) | null = null;

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

    const cardW = Math.min(CARD_MAX_WIDTH, screenW - 32);
    for (const id of SELECTOR_ORDER) {
      const def = CHARACTERS[id];
      if (!def) continue;
      const unlocked = UnlockManager.isUnlocked(id);
      const card = this.buildCard(def, cardW, unlocked, (picked) => {
        if (!unlocked) return;
        playSfx('ui.click');
        queueMicrotask(() => {
          void ctx.scenes.switchTo(new ArenaScene(picked), ctx);
        });
      });
      card.position.set(cx - cardW / 2, cursorY);
      this.container.addChild(card);
      cursorY += CARD_HEIGHT + CARD_GAP;
    }

    cursorY += 12;
    const backBtn = this.buildBackButton(() => {
      playSfx('ui.click');
      queueMicrotask(() => {
        void ctx.scenes.switchTo(new TitleScene(), ctx);
      });
    });
    backBtn.position.set(cx, cursorY + BTN_HEIGHT / 2);
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
    if (this.container) {
      ctx.app.stage.removeChild(this.container);
      this.container.destroy({ children: true });
      this.container = null;
    }
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

    const tex = AssetManager.getTexture(def.sprite.idle);
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

    const patternTint = def.attackPattern === 'ranged' ? CARD_RANGED_TINT : CARD_MELEE_TINT;
    const patternLabel = t(`characterSelect.pattern.${def.attackPattern}`);
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
