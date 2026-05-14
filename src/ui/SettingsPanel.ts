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
import { MODAL, SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkText } from './layoutHelpers';

const VOLUME_STEP = 0.1;
const STEPPER_SIZE = 32;
const ACTION_BUTTON_HEIGHT = 36;

export type SettingsPanelAction = 'resume' | 'quit-to-title';

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

  constructor(app: Application) {
    super(app, 'settings-panel');
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

  /** Override the default sizing — Settings only has a handful of
   *  short rows, so we size to content rather than fill the modal's
   *  max height. Width still uses the modal cap (clamped to the
   *  viewport), height comes from Yoga via `auto`, and we re-center
   *  using the measured Pixi bounds. */
  protected override applyPanelSize(): void {
    if (!this.panel) return;
    const w = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const maxH = this.app.screen.height - MODAL.margin;
    const existing = this.panel.layout?.style ?? {};
    this.panel.layout = { ...existing, width: w, height: 'auto', maxHeight: maxH };
    const measuredH = this.panel.getBounds().height || maxH;
    this.panel.position.set(
      Math.floor((this.app.screen.width - w) / 2),
      Math.floor((this.app.screen.height - measuredH) / 2),
    );
  }

  protected buildPanel(): Container {
    // No `flex: 1` — we want the panel to shrink to the content
    // (5 short rows + 2 action buttons) rather than fill the modal
    // box vertically. Height stays `auto`; `applyPanelSize()` below
    // re-centers based on the measured content height.
    const panel = mkPanel({
      layout: { gap: SPACING.gap, alignItems: 'stretch' },
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

    // --- Spacer + action buttons ---------------------------------------
    panel.addChild(new Container({ layout: { height: SPACING.gapLarge, isLeaf: true } }));
    panel.addChild(this.buildActionButton(t('settings.resume'), 'resume'));
    panel.addChild(this.buildActionButton(t('settings.quitToTitle'), 'quit-to-title'));

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
