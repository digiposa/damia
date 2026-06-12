/**
 * Mob picker — sub-modal used by the Training debug panel. Opens from
 * a single "Choose mob" button, presents every MobKind as a tappable
 * row, fires the selection callback + closes itself on pick. The
 * tester doesn't have to cycle through < / > to find the one they
 * want — works just as well at 7 mobs as it will at 50+.
 *
 * Layout: simple vertical scroll. Each row shows the mob's display
 * name + a thin "ELEMENT · HP X" subtitle so the picker reads like
 * the bestiary even at a glance. The active mob is highlighted gold.
 *
 * Scroll widget is the same Graphics-mask + manually-translated
 * content pattern that CodexPanel uses — copied inline rather than
 * extracted so this stays a self-contained Training-only widget; if
 * a third consumer needs scroll, that's when we pull it into a
 * shared helper.
 */
import type { Application, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';

import { MOBS, type MobKind } from '@data/balance';
import { t } from '@services/I18nService';

import { Modal } from './Modal';
import { COLORS, MODAL, SPACING, TEXT } from './theme';
import { mkCloseButton, mkPanel, mkRow, mkText } from './layoutHelpers';

const PANEL_MAX_HEIGHT = 560;
const TITLE_STRIP_HEIGHT = 32;
const ROW_HEIGHT = 52;

export class MobPickerModal extends Modal {
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;

  private selectListener: ((kind: MobKind) => void) | null = null;
  private currentSelection: MobKind | null = null;
  private scrollViewport: Container | null = null;
  private scrollMask: Graphics | null = null;
  private scrollContent: LayoutContainer | null = null;
  private scrollY = 0;
  private viewportHeight = 0;

  constructor(app: Application) {
    super(app, 'mob-picker-modal');
  }

  /** Set the listener called with the picked MobKind. The modal closes
   *  itself before firing the callback so the panel underneath sees
   *  the post-close state. */
  onPick(listener: (kind: MobKind) => void): void {
    this.selectListener = listener;
  }

  /** Highlight the matching row gold so the tester can see what's
   *  currently selected when reopening the picker. Call BEFORE open(). */
  setCurrentSelection(kind: MobKind): void {
    this.currentSelection = kind;
  }

  protected buildPanel(): LayoutContainer {
    const panel = mkPanel({
      layout: { flex: 1, gap: SPACING.gap, alignItems: 'stretch' },
    });

    const titleStrip = mkRow({
      layout: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: TITLE_STRIP_HEIGHT,
      },
    });
    titleStrip.addChild(new Container({ layout: { width: 28, height: 28, isLeaf: true } }));
    titleStrip.addChild(mkText(t('training.spawnMob'), TEXT.title));
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    panel.addChild(this.buildScrollArea());
    return panel;
  }

  // ---- Scroll widget (mirrors CodexPanel) ----

  private buildScrollArea(): Container {
    const viewport = new Container({
      label: 'mob-picker-viewport',
      layout: { width: '100%', flex: 1 },
    });
    viewport.eventMode = 'static';

    const mask = new Graphics();
    mask.rect(0, 0, 4096, 4096).fill(0xffffff);
    const content = new LayoutContainer({
      layout: { flexDirection: 'column', gap: SPACING.gapSmall, width: '100%' },
    });

    viewport.addChild(mask, content);
    viewport.mask = mask;
    this.scrollViewport = viewport;
    this.scrollMask = mask;
    this.scrollContent = content;
    this.wireScrollInputs(viewport);
    return viewport;
  }

  private wireScrollInputs(viewport: Container): void {
    let dragStartY: number | null = null;
    let dragStartScroll = 0;
    const onDown = (e: FederatedPointerEvent): void => {
      dragStartY = e.global.y;
      dragStartScroll = this.scrollY;
    };
    const onMove = (e: FederatedPointerEvent): void => {
      if (dragStartY === null) return;
      this.applyScroll(dragStartScroll + (e.global.y - dragStartY));
    };
    const onRelease = (): void => {
      dragStartY = null;
    };
    const onWheel = (e: FederatedWheelEvent): void => {
      e.preventDefault();
      this.applyScroll(this.scrollY - e.deltaY);
    };
    viewport.on('pointerdown', onDown);
    viewport.on('globalpointermove', onMove);
    viewport.on('pointerup', onRelease);
    viewport.on('pointerupoutside', onRelease);
    viewport.on('pointercancel', onRelease);
    viewport.on('wheel', onWheel);
  }

  private applyScroll(targetY: number): void {
    if (!this.scrollContent) return;
    const contentH = this.scrollContent.height || 0;
    const minY = Math.min(0, this.viewportHeight - contentH);
    this.scrollY = Math.max(minY, Math.min(0, targetY));
    this.scrollContent.y = this.scrollY;
  }

  protected override applyPanelSize(): void {
    super.applyPanelSize();
    const panelW = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const panelH = Math.min(this.panelMaxHeight, this.app.screen.height - MODAL.margin);
    const innerW = Math.max(0, panelW - 2 * SPACING.pad);
    const innerH = Math.max(0, panelH - 2 * SPACING.pad - TITLE_STRIP_HEIGHT - SPACING.gap);
    this.viewportHeight = innerH;
    if (this.scrollViewport) {
      this.scrollViewport.layout = {
        ...(this.scrollViewport.layout?.style ?? {}),
        width: innerW,
        height: innerH,
        flex: 0,
      };
    }
    if (this.scrollMask) {
      this.scrollMask.clear().rect(0, 0, innerW, innerH).fill(0xffffff);
    }
    if (this.scrollContent) {
      this.scrollContent.layout = {
        ...(this.scrollContent.layout?.style ?? {}),
        width: innerW,
      };
    }
    this.applyScroll(this.scrollY);
  }

  protected override onOpen(): void {
    this.renderRows();
    this.app.ticker.addOnce(() => this.applyScroll(this.scrollY), this);
  }

  private renderRows(): void {
    if (!this.scrollContent) return;
    this.scrollContent.removeChildren();
    this.scrollY = 0;
    this.scrollContent.y = 0;
    const kinds = Object.keys(MOBS) as MobKind[];
    for (const kind of kinds) {
      this.scrollContent.addChild(this.buildRow(kind));
    }
  }

  /** Single tappable row: name on the left, element / HP subtitle
   *  underneath, gold border when the row is the current selection. */
  private buildRow(kind: MobKind): LayoutContainer {
    const isSelected = kind === this.currentSelection;
    const mob = MOBS[kind];
    const row = new LayoutContainer({
      label: `mob-picker-row-${kind}`,
      layout: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        height: ROW_HEIGHT,
        paddingLeft: SPACING.pad,
        paddingRight: SPACING.pad,
        gap: 2,
        backgroundColor: COLORS.subPanelBg,
        borderColor: isSelected ? COLORS.borderActive : COLORS.border,
        borderWidth: isSelected ? 2 : 1,
        borderRadius: 6,
      },
    });
    row.addChild(mkText(t(`codex.entry.${kind}.name`), TEXT.header));
    row.addChild(
      mkText(`${t(`codex.element.${mob.element}`)} · HP ${mob.health}${mob.boss ? ' · ★' : ''}`, {
        ...TEXT.muted,
        fontSize: 11,
      }),
    );
    row.eventMode = 'static';
    row.cursor = 'pointer';
    row.on('pointertap', () => {
      this.close();
      this.selectListener?.(kind);
    });
    row.on('pointerover', () => {
      row.background.tint = COLORS.borderActive;
    });
    row.on('pointerout', () => {
      row.background.tint = 0xffffff;
    });
    return row;
  }
}
