import type { Application } from 'pixi.js';
import { Container, type Text } from 'pixi.js';
import { t, getLanguage, setLanguage, SUPPORTED_LANGUAGES } from '@services/I18nService';
import {
  getVolumes,
  playSfx,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setVoiceVolume,
} from '@services/AudioManager';
import {
  COMBAT_SPEED_MAX,
  COMBAT_SPEED_MIN,
  COMBAT_SPEED_STEP,
  getCombatSpeed,
  setCombatSpeed,
} from '@services/CombatPaceService';
import { Modal } from './Modal';
import { SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkText } from './layoutHelpers';
import { Slider } from './Slider';

/** Step for the volume sliders — 5% notches read cleanly as a
 *  percentage and give finer control than the old 10% stepper. */
const VOLUME_STEP = 0.05;
const STEPPER_SIZE = 32;
const ACTION_BUTTON_HEIGHT = 36;
/** Slider visual width (track + handle). Sized to be comfortable on a
 *  phone — large enough to read 5% steps, small enough to share the row
 *  with a label and a value readout. */
const SLIDER_WIDTH = 160;
const SLIDER_HEIGHT = 28;
/** Fixed width reserved for the "%" readout. Wide enough for the longest
 *  value ("150%") so the number growing from 2 to 3 digits never widens
 *  the row and shoves the slider sideways. Right-aligned within the box. */
const VALUE_BOX_WIDTH = 44;
/** Total panel height: title strip + 6 rows (4 volume + combat speed +
 *  language) + Bestiary button + spacer + 2 action buttons + gaps +
 *  padding. Sized so the panel is comfortably centered on every
 *  viewport, not stretched to the full modal max. */
const PANEL_MAX_HEIGHT = 560;

export type SettingsPanelAction = 'resume' | 'quit-to-title' | 'open-codex';

export interface SettingsPanelOptions {
  /** When false, hide the Resume / Quit-to-Title action buttons. Use
   *  when opening Settings outside a gameplay scene — typically from
   *  the title-screen gear icon, where neither action applies (we're
   *  already at the title, and there's no run to resume). Volumes +
   *  language stay editable. Defaults to true to preserve the
   *  in-gameplay behaviour. */
  showActions?: boolean;
}

type VolumeKind = 'master' | 'music' | 'sfx' | 'voice';

/** Config for one slider row — a 0..1-ish quantity surfaced as a % with
 *  a live getter/setter against its backing service. */
interface SliderRowConfig {
  min: number;
  max: number;
  step: number;
  get: () => number;
  set: (v: number) => void;
}

/**
 * Esc-toggled settings overlay. Volume sliders (4 channels) + combat-
 * speed slider, language toggle, Resume / Quit-to-Title actions. Built
 * on the shared Modal base + flex layout, so resize / responsive sizing
 * comes for free.
 */
export class SettingsPanel extends Modal {
  private actionListener: ((action: SettingsPanelAction) => void) | null = null;
  /** Per-row resync closures — each rewrites its value label and snaps
   *  its slider handle to the backing service value. Run on panel open
   *  so the controls reflect state changed elsewhere since last shown. */
  private readonly refreshers: Array<() => void> = [];
  private langValueText: Text | null = null;
  private readonly showActions: boolean;
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;

  constructor(app: Application, opts: SettingsPanelOptions = {}) {
    super(app, 'settings-panel');
    this.showActions = opts.showActions ?? true;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        this.toggle();
        playSfx('ui.click');
      }
    };
    window.addEventListener('keydown', onKey);
    this.registerCleanup(() => window.removeEventListener('keydown', onKey));
  }

  onAction(listener: (action: SettingsPanelAction) => void): void {
    this.actionListener = listener;
  }

  /** Back-compat alias for old call sites (`settings.toggle()` etc.). */
  show(): void {
    this.open();
  }
  /** Back-compat alias. */
  hide(): void {
    this.close();
  }

  protected override onOpen(): void {
    this.refreshValues();
  }

  protected buildPanel(): Container {
    // `flex: 1` lets the rows distribute remaining space evenly
    // inside the (centered) panel box rather than bunching at the
    // top — combined with the `panelMaxHeight = 460` cap, the
    // result is a comfortable panel that stays centered on every
    // viewport.
    const panel = mkPanel({
      layout: { flex: 1, gap: SPACING.gap, alignItems: 'stretch' },
    });

    // --- Title strip (title centered + close on the right) -------------
    const titleStrip = mkRow({
      layout: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 32,
      },
    });
    // Spacer on the left so the title visually centers despite the
    // close button only being on the right.
    titleStrip.addChild(new Container({ layout: { width: 28, height: 28, isLeaf: true } }));
    titleStrip.addChild(mkText(t('settings.title'), TEXT.title));
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    // --- Volume rows ----------------------------------------------------
    const vol = (k: VolumeKind, set: (v: number) => void): SliderRowConfig => ({
      min: 0,
      max: 1,
      step: VOLUME_STEP,
      get: () => getVolumes()[k],
      set,
    });
    this.buildSliderRow(panel, t('settings.master'), vol('master', setMasterVolume));
    this.buildSliderRow(panel, t('settings.music'), vol('music', setMusicVolume));
    this.buildSliderRow(panel, t('settings.sfx'), vol('sfx', setSfxVolume));
    this.buildSliderRow(panel, t('settings.voice'), vol('voice', setVoiceVolume));

    // --- Combat speed row -----------------------------------------------
    this.buildSliderRow(panel, t('settings.combatSpeed'), {
      min: COMBAT_SPEED_MIN,
      max: COMBAT_SPEED_MAX,
      step: COMBAT_SPEED_STEP,
      get: getCombatSpeed,
      set: setCombatSpeed,
    });

    // --- Language row ---------------------------------------------------
    this.langValueText = this.buildLangRow(panel, t('settings.language'));

    // --- Codex (always available, both in title + gameplay menus) -------
    panel.addChild(new Container({ layout: { height: SPACING.gapSmall, isLeaf: true } }));
    panel.addChild(this.buildActionButton(t('settings.codex'), 'open-codex'));

    // --- Spacer + action buttons (skipped when opened outside gameplay) -
    if (this.showActions) {
      panel.addChild(new Container({ layout: { height: SPACING.gapLarge, isLeaf: true } }));
      panel.addChild(this.buildActionButton(t('settings.resume'), 'resume'));
      panel.addChild(this.buildActionButton(t('settings.quitToTitle'), 'quit-to-title'));
    }

    return panel;
  }

  private buildSliderRow(parent: Container, label: string, cfg: SliderRowConfig): void {
    const row = mkRow({
      layout: { alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 },
    });
    row.addChild(mkText(label, TEXT.label));
    const right = mkRow({ layout: { alignItems: 'center', gap: 8 } });
    const value = mkText('', { ...TEXT.value, fontFamily: 'monospace' });
    // Fixed-width, right-aligned box so a 2→3 digit "%" doesn't widen
    // the row and push the slider left (the reported UX jump at 100%+).
    const valueBox = new Container({
      layout: {
        width: VALUE_BOX_WIDTH,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
    });
    valueBox.addChild(value);
    const slider = new Slider(this.app, {
      width: SLIDER_WIDTH,
      height: SLIDER_HEIGHT,
      min: cfg.min,
      max: cfg.max,
      step: cfg.step,
      value: cfg.get(),
      onChange: (v) => {
        cfg.set(v);
        // Update only this row's label — never call refreshValues() mid-
        // drag, or it'd snap the very slider being dragged via setValue.
        value.text = `${Math.round(v * 100)}%`;
      },
    });
    // Destroy stage listeners when the panel itself goes away.
    this.registerCleanup(() => slider.destroy());
    right.addChild(slider.container);
    right.addChild(valueBox);
    row.addChild(right);
    parent.addChild(row);
    this.refreshers.push(() => {
      const cur = cfg.get();
      value.text = `${Math.round(cur * 100)}%`;
      slider.setValue(cur);
    });
  }

  private buildLangRow(parent: Container, label: string): Text {
    const row = mkRow({
      layout: { alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 },
    });
    row.addChild(mkText(label, TEXT.label));
    const right = mkRow({ layout: { alignItems: 'center', gap: 8 } });
    const value = mkText('', { ...TEXT.value, fontFamily: 'monospace' });
    right.addChild(
      mkButton({
        label: '<',
        width: STEPPER_SIZE,
        height: STEPPER_SIZE,
        fontSize: 18,
        onTap: () => this.cycleLanguage(-1),
      }),
    );
    right.addChild(value);
    right.addChild(
      mkButton({
        label: '>',
        width: STEPPER_SIZE,
        height: STEPPER_SIZE,
        fontSize: 18,
        onTap: () => this.cycleLanguage(1),
      }),
    );
    row.addChild(right);
    parent.addChild(row);
    return value;
  }

  private buildActionButton(label: string, action: SettingsPanelAction): Container {
    // Use 100% width so the button stretches to the panel's inner width.
    const wrapper = new Container({
      layout: { width: '100%', height: ACTION_BUTTON_HEIGHT, alignItems: 'stretch' },
    });
    const btn = mkButton({
      label,
      width: 360, // best-effort default; full width comes from flex stretch
      height: ACTION_BUTTON_HEIGHT,
      onTap: () => {
        playSfx('ui.click');
        this.actionListener?.(action);
      },
    });
    btn.layout = {
      ...(btn.layout?.style ?? {}),
      width: '100%',
      height: ACTION_BUTTON_HEIGHT,
      flex: 1,
    };
    wrapper.addChild(btn);
    return wrapper;
  }

  private cycleLanguage(direction: number): void {
    playSfx('ui.click');
    const cur = getLanguage();
    const idx = SUPPORTED_LANGUAGES.indexOf(cur);
    const next =
      SUPPORTED_LANGUAGES[
        (idx + direction + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length
      ];
    if (next && next !== cur) setLanguage(next);
  }

  private refreshValues(): void {
    this.refreshers.forEach((fn) => fn());
    if (this.langValueText) this.langValueText.text = getLanguage().toUpperCase();
  }
}
