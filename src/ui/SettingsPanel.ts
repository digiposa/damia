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
import { Modal } from './Modal';
import { SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkText } from './layoutHelpers';

const VOLUME_STEP = 0.1;
const STEPPER_SIZE = 32;
const ACTION_BUTTON_HEIGHT = 36;
/** Total panel height: title strip + 5 rows + spacer + 2 buttons +
 *  gaps + padding. Sized so the panel is comfortably centered on
 *  every viewport, not stretched to the full modal max. */
const PANEL_MAX_HEIGHT = 460;

export type SettingsPanelAction = 'resume' | 'quit-to-title';

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

/**
 * Esc-toggled settings overlay. Volume sliders (4 channels), language
 * toggle, Resume / Quit-to-Title actions. Built on the shared Modal
 * base + flex layout, so resize / responsive sizing comes for free.
 */
export class SettingsPanel extends Modal {
  private actionListener: ((action: SettingsPanelAction) => void) | null = null;
  /** Refs to value Text nodes so refreshValues() can rewrite them
   *  without rebuilding the panel. */
  private masterValueText: Text | null = null;
  private musicValueText: Text | null = null;
  private sfxValueText: Text | null = null;
  private voiceValueText: Text | null = null;
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
    this.masterValueText = this.buildVolumeRow(panel, t('settings.master'), 'master');
    this.musicValueText = this.buildVolumeRow(panel, t('settings.music'), 'music');
    this.sfxValueText = this.buildVolumeRow(panel, t('settings.sfx'), 'sfx');
    this.voiceValueText = this.buildVolumeRow(panel, t('settings.voice'), 'voice');

    // --- Language row ---------------------------------------------------
    this.langValueText = this.buildLangRow(panel, t('settings.language'));

    // --- Spacer + action buttons (skipped when opened outside gameplay) -
    if (this.showActions) {
      panel.addChild(new Container({ layout: { height: SPACING.gapLarge, isLeaf: true } }));
      panel.addChild(this.buildActionButton(t('settings.resume'), 'resume'));
      panel.addChild(this.buildActionButton(t('settings.quitToTitle'), 'quit-to-title'));
    }

    return panel;
  }

  private buildVolumeRow(parent: Container, label: string, kind: VolumeKind): Text {
    const row = mkRow({
      layout: { alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 },
    });
    row.addChild(mkText(label, TEXT.label));
    const right = mkRow({ layout: { alignItems: 'center', gap: 8 } });
    const value = mkText('', { ...TEXT.value, fontFamily: 'monospace' });
    right.addChild(
      mkButton({
        label: '-',
        width: STEPPER_SIZE,
        height: STEPPER_SIZE,
        fontSize: 18,
        onTap: () => this.adjustVolume(kind, -VOLUME_STEP),
      }),
    );
    right.addChild(value);
    right.addChild(
      mkButton({
        label: '+',
        width: STEPPER_SIZE,
        height: STEPPER_SIZE,
        fontSize: 18,
        onTap: () => this.adjustVolume(kind, VOLUME_STEP),
      }),
    );
    row.addChild(right);
    parent.addChild(row);
    return value;
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

  private adjustVolume(kind: VolumeKind, delta: number): void {
    playSfx('ui.click');
    const v = getVolumes();
    const next = Math.max(0, Math.min(1, v[kind] + delta));
    if (kind === 'master') setMasterVolume(next);
    else if (kind === 'music') setMusicVolume(next);
    else if (kind === 'sfx') setSfxVolume(next);
    else setVoiceVolume(next);
    this.refreshValues();
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
    if (!this.masterValueText) return;
    const v = getVolumes();
    this.masterValueText.text = `${Math.round(v.master * 100)}%`;
    if (this.musicValueText) this.musicValueText.text = `${Math.round(v.music * 100)}%`;
    if (this.sfxValueText) this.sfxValueText.text = `${Math.round(v.sfx * 100)}%`;
    if (this.voiceValueText) this.voiceValueText.text = `${Math.round(v.voice * 100)}%`;
    if (this.langValueText) this.langValueText.text = getLanguage().toUpperCase();
  }
}
