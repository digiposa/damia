/**
 * Mob picker — sub-modal used by the Training debug panel. Opens from
 * a single "Choose mob" button, presents every MobKind as a tappable
 * row, fires the selection callback + closes itself on pick. The
 * tester doesn't have to cycle through < / > to find the one they
 * want — works just as well at 7 mobs as it will at 80+.
 *
 * Layout: search bar at the top + alphabetical scrollable list. Each
 * row shows the mob's display name + a thin "ELEMENT · HP X" subtitle
 * so the picker reads like the bestiary even at a glance. The active
 * mob is highlighted gold.
 *
 * Search is an HTML `<input>` overlay (Pixi has no native text input
 * widget). Positioned over the canvas in viewport coordinates,
 * synced on open / close / resize / panel reposition. Filters the
 * list live on every keystroke (case-insensitive substring match
 * against the localized display name).
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
const SEARCH_BAR_HEIGHT = 36;
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
  /** HTML search input overlaid on the canvas. Created on first open,
   *  removed on every close so the DOM stays clean between sessions. */
  private searchInput: HTMLInputElement | null = null;
  /** Lowercased substring filter applied to row names. Empty = show all. */
  private searchTerm = '';

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

    // Reserved Pixi slot for the HTML search input overlay. We keep
    // it in the layout flow so Yoga reserves the vertical space
    // correctly; the input itself is a DOM element absolutely
    // positioned over this slot — see ensureSearchInput().
    panel.addChild(
      new Container({
        label: 'mob-picker-search-slot',
        layout: { width: '100%', height: SEARCH_BAR_HEIGHT, isLeaf: true },
      }),
    );

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
    const innerH = Math.max(
      0,
      panelH - 2 * SPACING.pad - TITLE_STRIP_HEIGHT - SEARCH_BAR_HEIGHT - 2 * SPACING.gap,
    );
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
    this.positionSearchInput();
    this.applyScroll(this.scrollY);
  }

  protected override onOpen(): void {
    this.searchTerm = '';
    this.ensureSearchInput();
    this.renderRows();
    this.app.ticker.addOnce(() => this.applyScroll(this.scrollY), this);
  }

  protected override onClose(): void {
    this.destroySearchInput();
    this.searchTerm = '';
  }

  // ---- HTML search input overlay ----

  /** Create + mount the DOM `<input>` if it doesn't exist yet, and
   *  give it focus so the tester can start typing immediately.
   *  Styled to match the panel theme: dark navy fill, sandy border,
   *  gold focus glow + magnifier prefix glyph so it reads as a search
   *  field at a glance. */
  private ensureSearchInput(): void {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchInput.focus();
      return;
    }
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = `\u{1F50D}  ${t('training.searchPlaceholder')}`;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.dataset['damiaPicker'] = 'mob';
    Object.assign(input.style, {
      position: 'fixed',
      zIndex: '1000',
      boxSizing: 'border-box',
      padding: '8px 12px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '500',
      color: '#ffffff',
      backgroundColor: '#0e1320',
      border: '1px solid #a08050',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
      // Subtle inner shadow so the input looks recessed against the panel.
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.35)',
      caretColor: '#eec040',
    });
    // Focus glow: brighter border + gold halo + slightly lifted bg.
    input.addEventListener('focus', () => {
      Object.assign(input.style, {
        borderColor: '#eec040',
        backgroundColor: '#1a1f2b',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.35), 0 0 0 3px rgba(238, 192, 64, 0.18)',
      });
    });
    input.addEventListener('blur', () => {
      Object.assign(input.style, {
        borderColor: '#a08050',
        backgroundColor: '#0e1320',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.35)',
      });
    });
    input.addEventListener('input', () => {
      this.searchTerm = input.value.trim().toLowerCase();
      this.renderRows();
      this.app.ticker.addOnce(() => this.applyScroll(0), this);
    });
    // Esc inside the input: first clear the text, then (if already
    // empty) close the modal — same "back out gradually" feel users
    // expect from a search-bar UX.
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      if (input.value !== '') {
        input.value = '';
        this.searchTerm = '';
        this.renderRows();
        return;
      }
      this.close();
    });
    document.body.appendChild(input);
    this.searchInput = input;
    this.positionSearchInput();
    // Focus next tick so the modal's mount doesn't steal it.
    queueMicrotask(() => input.focus());
  }

  private destroySearchInput(): void {
    if (!this.searchInput) return;
    this.searchInput.remove();
    this.searchInput = null;
  }

  /** Sync the DOM input's position to the modal's reserved Pixi slot.
   *  Called from applyPanelSize (modal open + viewport resize). */
  private positionSearchInput(): void {
    if (!this.searchInput) return;
    const panelW = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const panelH = Math.min(this.panelMaxHeight, this.app.screen.height - MODAL.margin);
    const panelLeft = Math.floor((this.app.screen.width - panelW) / 2);
    const panelTop = Math.floor((this.app.screen.height - panelH) / 2);
    const innerW = Math.max(0, panelW - 2 * SPACING.pad);
    // Slot Y inside the panel = padding + title strip + first gap.
    const slotY = SPACING.pad + TITLE_STRIP_HEIGHT + SPACING.gap;
    // Translate canvas-relative coords to viewport-fixed coords via
    // the canvas's bounding rect — the canvas is itself absolutely
    // positioned somewhere in the document (mobile safe-area, etc.).
    const canvasRect = this.app.canvas.getBoundingClientRect();
    Object.assign(this.searchInput.style, {
      left: `${canvasRect.left + panelLeft + SPACING.pad}px`,
      top: `${canvasRect.top + panelTop + slotY}px`,
      width: `${innerW}px`,
      height: `${SEARCH_BAR_HEIGHT}px`,
    });
  }

  // ---- Filtered / sorted row rendering ----

  private renderRows(): void {
    if (!this.scrollContent) return;
    this.scrollContent.removeChildren();
    this.scrollY = 0;
    this.scrollContent.y = 0;
    // Sort alphabetically by the localized display name so the list
    // is predictable regardless of MobKind declaration order.
    const sorted = (Object.keys(MOBS) as MobKind[])
      .slice()
      .sort((a, b) => t(`codex.entry.${a}.name`).localeCompare(t(`codex.entry.${b}.name`)));
    const filtered = this.searchTerm
      ? sorted.filter((kind) =>
          t(`codex.entry.${kind}.name`).toLowerCase().includes(this.searchTerm),
        )
      : sorted;
    if (filtered.length === 0) {
      this.scrollContent.addChild(mkText(t('codex.empty'), TEXT.muted));
      return;
    }
    for (const kind of filtered) {
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
