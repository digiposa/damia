import type { Application } from 'pixi.js';
import { Container, Graphics, Sprite as PixiSprite, Text } from 'pixi.js';
import { t } from '@services/I18nService';
import { AssetManager } from '@services/AssetManager';
import { SafeArea } from '@services/SafeArea';
import { isTouchDevice } from '@services/Device';
import { COLORS, TEXT } from './theme';

const PORTRAIT_SIZE = 72;
const BAR_WIDTH = 200;
const BAR_HEIGHT = 14;
const PADDING = 12;
const BAR_GAP = 6;
/** Square Dragoon-transform button glued to the right edge of the bar
 *  column. Big enough for a desktop click + reads its state from a
 *  single per-frame call (`setDragoonState`). Hidden on touch — the
 *  TouchActionButtons cluster already owns that affordance. */
const DG_BTN_SIZE = 32;
const DG_BTN_GAP = 8;

/**
 * Top-left HUD: portrait, HP/SP/MP bars, level pip, gold + XP + zoom
 * counters. Pure renderer — `update(world, playerId)` is called each
 * frame from the scene; the HUD just exposes typed setters and never
 * reads world state directly.
 *
 * Positioning is precise + corner-anchored (not flex-based), so this
 * module composes its visuals from theme tokens (`COLORS` / `TEXT`)
 * instead of the layout helpers used by modal panels.
 */
export class Hud {
  readonly container: Container;
  private readonly hpBar: Graphics;
  private readonly hpText: Text;
  private readonly spBar: Graphics;
  private readonly spText: Text;
  private readonly mpBar: Graphics;
  private readonly mpText: Text;
  private readonly goldText: Text;
  private readonly levelText: Text;
  private readonly xpText: Text;
  private readonly zoomText: Text;
  /** Dragoon transform button (desktop only). The frame redraws on
   *  every `setDragoonState` to reflect ready / active / charging.
   *  The inner sprite swaps between the 3 "eye opening" frames
   *  (ui.dragoon.eye.1/2/3) tied to the SP gauge — closed when empty,
   *  half-lidded mid-charge, fully open when ready. Hidden when locked
   *  or on touch. */
  private readonly dragoonBtn: Container;
  private readonly dragoonFrame: Graphics;
  private readonly dragoonEye: PixiSprite;
  private dragoonTapHandler: (() => void) | null = null;

  constructor(app: Application) {
    this.container = new Container({ label: 'hud' });

    // Portrait frame + Dart picture. The square frame stays as a
    // backing so the portrait reads even on busy backgrounds; a fitted
    // Pixi.Sprite sits on top, with a text fallback when the asset
    // isn't loaded.
    const portraitBg = new Graphics()
      .roundRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE, 6)
      .fill(COLORS.portraitBg)
      .stroke({ width: 2, color: COLORS.border, alpha: 0.9 });
    const portraitTex = AssetManager.getTexture('ui.portrait.dart');
    const portraitVisual: PixiSprite | Text = portraitTex
      ? (() => {
          const s = new PixiSprite(portraitTex);
          const ratio = Math.min(
            PORTRAIT_SIZE / portraitTex.width,
            PORTRAIT_SIZE / portraitTex.height,
          );
          s.width = portraitTex.width * ratio;
          s.height = portraitTex.height * ratio;
          s.position.set((PORTRAIT_SIZE - s.width) / 2, (PORTRAIT_SIZE - s.height) / 2);
          return s;
        })()
      : (() => {
          const text = new Text({
            text: t('hud.dart'),
            style: { ...TEXT.value, fill: COLORS.textCream },
          });
          text.anchor.set(0.5);
          text.position.set(PORTRAIT_SIZE / 2, PORTRAIT_SIZE / 2);
          return text;
        })();

    const barsX = PORTRAIT_SIZE + 10;
    const barLabelStyle = { ...TEXT.gauge, fontSize: 12, fill: COLORS.textCream };
    const counterStyle = {
      ...TEXT.value,
      fontSize: 13,
      fill: COLORS.gold,
      stroke: { color: COLORS.textStroke, width: 2 },
    };

    // HP
    const hpBg = new Graphics().roundRect(barsX, 4, BAR_WIDTH, BAR_HEIGHT, 3).fill(COLORS.hpBg);
    this.hpBar = new Graphics();
    this.hpText = new Text({ text: '', style: barLabelStyle });
    this.hpText.position.set(barsX + 6, 5);

    // SP
    const spY = 4 + BAR_HEIGHT + BAR_GAP;
    const spBg = new Graphics().roundRect(barsX, spY, BAR_WIDTH, BAR_HEIGHT, 3).fill(COLORS.spBg);
    this.spBar = new Graphics();
    this.spText = new Text({ text: '', style: barLabelStyle });
    this.spText.position.set(barsX + 6, spY + 1);

    // MP — third bar, below SP. Currently a placeholder (Dragoon
    // system not wired yet) but exposed so the HUD layout doesn't
    // shift later.
    const mpY = spY + BAR_HEIGHT + BAR_GAP;
    const mpBg = new Graphics().roundRect(barsX, mpY, BAR_WIDTH, BAR_HEIGHT, 3).fill(COLORS.mpBg);
    this.mpBar = new Graphics();
    this.mpText = new Text({ text: '', style: barLabelStyle });
    this.mpText.position.set(barsX + 6, mpY + 1);

    // Gold counter — sits below the MP bar so it doesn't shove the
    // bars around when it gains digits.
    this.goldText = new Text({ text: '', style: counterStyle });
    this.goldText.position.set(barsX, mpY + BAR_HEIGHT + 4);

    // XP counter — text-only, just under the MP bar next to the gold
    // counter. No progress bar yet; update is cheap (text change on
    // level-up / kill).
    this.xpText = new Text({
      text: '',
      style: { ...counterStyle, fontSize: 12 },
    });
    this.xpText.position.set(barsX + 90, mpY + BAR_HEIGHT + 4);

    // Zoom indicator — small read-out so the player can gauge sprite
    // scale. Sits at the far right of the gold/xp line. Hidden on
    // touch — no zoom control there (pan/wheel disabled, no pinch
    // yet) and the label was overlapping with the menu-button column
    // on narrow phones.
    this.zoomText = new Text({
      text: '',
      style: {
        ...TEXT.muted,
        fontSize: 12,
        fill: COLORS.textSand,
        stroke: { color: COLORS.textStroke, width: 2 },
      },
    });
    this.zoomText.position.set(barsX + 200, mpY + BAR_HEIGHT + 4);
    this.zoomText.visible = !isTouchDevice();

    // Level pip — top-left of the portrait, small badge so it doesn't
    // compete with the portrait art.
    this.levelText = new Text({
      text: 'LV 1',
      style: {
        ...TEXT.value,
        fontSize: 12,
        fill: COLORS.textCream,
        stroke: { color: COLORS.textStroke, width: 3 },
      },
    });
    this.levelText.position.set(4, 4);

    // Dragoon transform button — right of the SP bar, vertically
    // centred on it. Stacks (in z order from back to front): frame
    // (border + bg), fill (SP-gauge inside the button), label.
    // Hidden on touch since TouchActionButtons owns that affordance
    // in the bottom-right cluster.
    const dragoonCx = barsX + BAR_WIDTH + DG_BTN_GAP + DG_BTN_SIZE / 2;
    const dragoonCy = spY + BAR_HEIGHT / 2;
    this.dragoonBtn = new Container({ label: 'hud-dragoon-btn' });
    this.dragoonBtn.position.set(dragoonCx, dragoonCy);
    this.dragoonFrame = new Graphics();
    // Eye sprite — initialised to the closed frame; setDragoonState swaps
    // the texture to .2 / .3 as the SP gauge fills. The texture is
    // resolved via AssetManager so an asset that hasn't loaded yet
    // surfaces as a null sprite (transparent) rather than crashing the
    // HUD construction — first paint flips to the real texture as soon
    // as the preload settles.
    const initialEyeTex = AssetManager.getTexture('ui.dragoon.eye.1');
    this.dragoonEye = initialEyeTex ? new PixiSprite(initialEyeTex) : new PixiSprite();
    this.dragoonEye.anchor.set(0.5);
    // Inset by the border thickness on each side so the eye doesn't paint
    // over the frame ring.
    const eyeFit = DG_BTN_SIZE - 4;
    this.dragoonEye.width = eyeFit;
    this.dragoonEye.height = eyeFit;
    this.dragoonBtn.addChild(this.dragoonFrame, this.dragoonEye);
    this.dragoonBtn.eventMode = 'static';
    this.dragoonBtn.cursor = 'pointer';
    this.dragoonBtn.on('pointertap', () => {
      // The handler still no-ops when conditions aren't met (locked,
      // SP not full, already transformed) — same semantics as the
      // touch button and the `T` key.
      this.dragoonTapHandler?.();
    });
    // Default state: locked + invisible. setDragoonState() will flip
    // visible once the world reports `dragoonUnlocked`.
    this.dragoonBtn.visible = false;
    if (isTouchDevice()) {
      // Touch has its own Dragoon button in TouchActionButtons. Never
      // mount the HUD-bar one even if state later says unlocked.
      this.dragoonBtn.eventMode = 'none';
    }

    this.container.addChild(
      portraitBg,
      portraitVisual,
      this.levelText,
      hpBg,
      this.hpBar,
      this.hpText,
      spBg,
      this.spBar,
      this.spText,
      mpBg,
      this.mpBar,
      this.mpText,
      this.goldText,
      this.xpText,
      this.zoomText,
      this.dragoonBtn,
    );

    this.reposition();
    app.renderer.on('resize', () => this.reposition());
  }

  setHealth(current: number, max: number): void {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    this.hpBar
      .clear()
      .roundRect(PORTRAIT_SIZE + 10, 4, BAR_WIDTH * ratio, BAR_HEIGHT, 3)
      .fill(COLORS.hpFg);
    this.hpText.text = `HP ${Math.round(current)} / ${max}`;
  }

  setSp(current: number, max: number, locked = false): void {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const spY = 4 + BAR_HEIGHT + BAR_GAP;
    this.spBar.clear();
    if (!locked) {
      this.spBar
        .roundRect(PORTRAIT_SIZE + 10, spY, BAR_WIDTH * ratio, BAR_HEIGHT, 3)
        .fill(COLORS.spFg);
      this.spText.text = `SP ${Math.round(current)} / ${max}`;
    } else {
      // Locked: empty bar slot, "—" label. Keeps the layout stable so
      // unlock during a run doesn't shift the MP bar around. Aligned
      // with VISION §6.5 — Dragoon (and its SP gauge) is hidden until
      // the avatar earns access to the form.
      this.spText.text = 'SP —';
    }
  }

  /**
   * Drive the desktop Dragoon transform button. Called every frame by
   * the gameplay controller, same cadence as `setSp`. State machine:
   *  - `unlocked: false` → button hidden (Dragoon form not earned yet,
   *    VISION §6.5).
   *  - `active: true` → magenta border + bright fill (currently
   *    transformed; tap is a no-op while the form runs out).
   *  - `spFrac >= 1` → gold border ring, label bright (tap = transform).
   *  - otherwise → dim border, vertical fill grows from the bottom up
   *    in step with the SP gauge so the player can read "almost there".
   * The handler attached via `onDragoonTap` already gates by the same
   * conditions, so a tap below the threshold is harmless.
   */
  setDragoonState(state: { unlocked: boolean; spFrac: number; active: boolean }): void {
    if (!state.unlocked || isTouchDevice()) {
      this.dragoonBtn.visible = false;
      return;
    }
    this.dragoonBtn.visible = true;
    const half = DG_BTN_SIZE / 2;
    const radius = 6;
    const frac = Math.max(0, Math.min(1, state.spFrac));
    const ready = frac >= 1;

    // Background + border. Border colour signals readiness at a glance:
    // magenta while transformed, gold ring when ready to tap, dim grey
    // while charging. Magenta is canon TLoD's transform glow; not a
    // theme token yet so keep it inline.
    const DRAGOON_ACTIVE_COLOR = 0xd450ff;
    const borderColor = state.active ? DRAGOON_ACTIVE_COLOR : ready ? COLORS.gold : COLORS.border;
    const borderWidth = state.active || ready ? 2 : 1;
    this.dragoonFrame
      .clear()
      .roundRect(-half, -half, DG_BTN_SIZE, DG_BTN_SIZE, radius)
      .fill({ color: COLORS.tileBg ?? COLORS.spBg, alpha: 0.92 })
      .stroke({ width: borderWidth, color: borderColor, alpha: 0.95 });

    // Eye-opening animation tied to SP. Picking the frame by fraction
    // (vs cycling on a timer) lets the player feel the gauge filling
    // through the icon itself — closed eye → half-lidded → fully open
    // matches "asleep / waking / awake". Once transformed, the eye
    // stays fully open (we're "inside" the form). Cycling could come
    // back as a polish pass with a glow filter behind it.
    let eyeAlias: 'ui.dragoon.eye.1' | 'ui.dragoon.eye.2' | 'ui.dragoon.eye.3';
    if (state.active || ready) {
      eyeAlias = 'ui.dragoon.eye.3';
    } else if (frac >= 0.5) {
      eyeAlias = 'ui.dragoon.eye.2';
    } else {
      eyeAlias = 'ui.dragoon.eye.1';
    }
    const desiredTex = AssetManager.getTexture(eyeAlias);
    if (desiredTex && this.dragoonEye.texture !== desiredTex) {
      this.dragoonEye.texture = desiredTex;
    }
  }

  /** Attach the tap handler. Called once at HUD construction site. */
  onDragoonTap(cb: () => void): void {
    this.dragoonTapHandler = cb;
  }

  setMp(current: number, max: number): void {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const mpY = 4 + (BAR_HEIGHT + BAR_GAP) * 2;
    this.mpBar
      .clear()
      .roundRect(PORTRAIT_SIZE + 10, mpY, BAR_WIDTH * ratio, BAR_HEIGHT, 3)
      .fill(COLORS.mpFg);
    this.mpText.text = `MP ${Math.round(current)} / ${max}`;
  }

  setGold(amount: number): void {
    this.goldText.text = `${amount} G`;
  }

  setLevel(level: number): void {
    this.levelText.text = `LV ${level}`;
  }

  setXp(current: number, max: number): void {
    this.xpText.text = `EXP ${Math.round(current)} / ${max}`;
  }

  setZoom(scale: number): void {
    this.zoomText.text = `Zoom ${scale.toFixed(2)}×`;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  private reposition(): void {
    // Top-left on mobile portrait: bottom-anchoring buried the HUD
    // under the joystick + hotbar + EXP bar. The HUD is internally
    // laid out around (0, 0) so its origin is also the top-left of
    // the portrait frame — pin it directly to the top-left corner.
    // Safe-area insets push the anchor clear of the notch / Dynamic
    // Island on iPhone and status bars / cutouts on Android.
    this.container.position.set(PADDING + SafeArea.left, PADDING + SafeArea.top);
  }
}
