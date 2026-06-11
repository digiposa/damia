/**
 * In-game Codex — read-only browseable catalogue with tabs for each
 * content family (mobs / bosses / playable characters; items + magic
 * land later). Opened from the Settings menu (gear icon on title,
 * Esc in gameplay), so it doesn't need a gameplay hook.
 *
 * UX:
 *  - Tab strip at the top → switches the active list.
 *  - Scrollable content panel (drag on touch, mouse wheel on desktop).
 *  - One card per entry. Mobs/bosses show canon (PS1) vs engine
 *    stats side by side so a damage-check pass can spot drift.
 *  - Characters show archetype + element (portrait + sprite ship in
 *    a follow-up — V1 keeps the list text-only so the file stays
 *    cheap to load).
 *
 * Scrolling: implemented inline with a Graphics mask + a manually-
 * translated content container. Drag distance scrolls the content;
 * Pixi's FederatedWheelEvent gives us mouse-wheel + trackpad on
 * desktop. Pointer events handle both touch and mouse, so the same
 * code path serves both form factors.
 *
 * Entry curation lives in `MOB_ENTRY_ORDER` (mob/boss tabs) — adding
 * a mob to MOBS doesn't auto-list it; we promote here once stats are
 * vetted. Character tab iterates ARCHETYPE_ORDER + AVATARS_BY_ARCHETYPE
 * so every playable face shows up automatically.
 */
import type { Application, FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';

import { MOBS, type MobKind } from '@data/balance';
import { MOBS_TLOD } from '@data/mobsTLoD';
import {
  ARCHETYPE_ORDER,
  AVATARS_BY_ARCHETYPE,
  type CharacterAvatar,
} from '@data/characters';
import { t } from '@services/I18nService';

import { Modal } from './Modal';
import { COLORS, SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

type CodexTab = 'mobs' | 'bosses' | 'characters';

/** Curated list driving the Mobs + Bosses tabs. Split at render time
 *  via `MOBS[kind].boss`. Order roughly follows TLoD encounter order
 *  so the screen reads like a campaign log. */
const MOB_ENTRY_ORDER: ReadonlyArray<MobKind> = [
  'sandoraKnight',
  'berserkMouse',
  'goblin',
  'assassinCock',
  'trent',
  'fruegel',
];

const TABS: ReadonlyArray<CodexTab> = ['mobs', 'bosses', 'characters'];

/** Modal max-height ceiling on desktop. Mobile clamps further against
 *  the viewport via the base Modal — no extra work needed there. */
const PANEL_MAX_HEIGHT = 720;
/** Tab strip row height. Big enough to be a comfortable touch target
 *  (44 px is the Apple HIG floor; we go 40 to keep the strip compact
 *  while still passing the thumb test). */
const TAB_HEIGHT = 40;

export class CodexPanel extends Modal {
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;

  private activeTab: CodexTab = 'mobs';
  private readonly tabButtons = new Map<CodexTab, LayoutContainer>();

  // Scroll widget — populated by buildPanel(). Inner content is a
  // LayoutContainer so Yoga handles card stacking + chip wrapping;
  // outer viewport is a regular Container so we can mask + translate.
  private scrollViewport: Container | null = null;
  private scrollMask: Graphics | null = null;
  private scrollContent: LayoutContainer | null = null;
  private scrollY = 0;

  constructor(app: Application) {
    super(app, 'codex-panel');
  }

  protected buildPanel(): LayoutContainer {
    const panel = mkPanel({
      layout: { flex: 1, gap: SPACING.gap, alignItems: 'stretch' },
    });

    // --- Header --------------------------------------------------------
    const titleStrip = mkRow({
      layout: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 32,
      },
    });
    titleStrip.addChild(new Container({ layout: { width: 28, height: 28, isLeaf: true } }));
    titleStrip.addChild(mkText(t('codex.title'), TEXT.title));
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    // --- Tab strip -----------------------------------------------------
    const tabsRow = mkRow({
      layout: { width: '100%', gap: SPACING.gapSmall, height: TAB_HEIGHT },
    });
    for (const tab of TABS) {
      const btn = mkButton({
        label: t(`codex.tab.${tab}`),
        width: 120,
        height: TAB_HEIGHT,
        onTap: () => this.setActiveTab(tab),
      });
      // Let each tab share the row width equally — Yoga's flex: 1 +
      // width: 100% gives 3-tabs-fill-the-row on every viewport.
      btn.layout = { ...(btn.layout?.style ?? {}), flex: 1, width: '100%' };
      this.tabButtons.set(tab, btn);
      tabsRow.addChild(btn);
    }
    panel.addChild(tabsRow);

    // --- Scrollable list ----------------------------------------------
    panel.addChild(this.buildScrollArea());

    return panel;
  }

  // ---- Scroll widget --------------------------------------------------

  private buildScrollArea(): Container {
    const viewport = new Container({
      label: 'codex-scroll-viewport',
      layout: { width: '100%', flex: 1 },
    });
    viewport.eventMode = 'static';

    const mask = new Graphics();
    const content = new LayoutContainer({
      layout: {
        flexDirection: 'column',
        gap: SPACING.gap,
        width: '100%',
      },
    });

    viewport.addChild(mask, content);
    viewport.mask = mask;

    this.scrollViewport = viewport;
    this.scrollMask = mask;
    this.scrollContent = content;

    this.wireScrollInputs(viewport);

    // Mask is sized once Yoga has measured the viewport — that happens
    // inside applyPanelSize() (override below), which runs on open +
    // every resize.
    return viewport;
  }

  /** Touch drag + mouse wheel scroll. Drag uses the pointer's global Y
   *  delta so the gesture feels 1:1 on both touch and mouse. Wheel
   *  events come through Pixi's FederatedWheelEvent (same shape as
   *  the DOM WheelEvent, dispatched by the canvas as soon as the
   *  pointer hovers a static-eventMode container). */
  private wireScrollInputs(viewport: Container): void {
    let dragStartY: number | null = null;
    let dragStartScroll = 0;

    const onDown = (e: FederatedPointerEvent): void => {
      dragStartY = e.global.y;
      dragStartScroll = this.scrollY;
    };
    const onMove = (e: FederatedPointerEvent): void => {
      if (dragStartY === null) return;
      const delta = e.global.y - dragStartY;
      this.applyScroll(dragStartScroll + delta);
    };
    const onRelease = (): void => {
      dragStartY = null;
    };
    const onWheel = (e: FederatedWheelEvent): void => {
      // preventDefault stops the page from scrolling under our canvas
      // when the codex is open on desktop.
      e.preventDefault();
      this.applyScroll(this.scrollY - e.deltaY);
    };

    viewport.on('pointerdown', onDown);
    // globalpointermove keeps the scroll tracking even when the finger
    // wanders outside the viewport mid-drag — important on mobile where
    // a tall list invites a long swipe that runs into the modal edge.
    viewport.on('globalpointermove', onMove);
    viewport.on('pointerup', onRelease);
    viewport.on('pointerupoutside', onRelease);
    viewport.on('pointercancel', onRelease);
    viewport.on('wheel', onWheel);
  }

  private applyScroll(targetY: number): void {
    if (!this.scrollContent || !this.scrollViewport) return;
    const viewH = this.scrollViewport.height || 0;
    const contentH = this.scrollContent.height || 0;
    const minY = Math.min(0, viewH - contentH);
    const maxY = 0;
    this.scrollY = Math.max(minY, Math.min(maxY, targetY));
    this.scrollContent.y = this.scrollY;
  }

  /** Schedule the scroll mask refresh + scroll clamp on the next tick.
   *  Both the viewport size and the content height need the @pixi/layout
   *  Yoga pass to have run — and that happens during render, not when
   *  applyPanelSize() returns. We defer to a single tick so the same
   *  refresh covers open + resize + tab switch. */
  private scheduleScrollRefresh(): void {
    this.app.ticker.addOnce(() => {
      if (this.scrollMask && this.scrollViewport) {
        const w = this.scrollViewport.width || 0;
        const h = this.scrollViewport.height || 0;
        this.scrollMask.clear().rect(0, 0, w, h).fill(0xffffff);
      }
      this.applyScroll(this.scrollY);
    }, this);
  }

  /** Resize the mask + clamp the scroll position. Called by the base
   *  Modal's applyPanelSize hook (which runs on every viewport resize
   *  AND on open) so the codex stays usable across orientation changes. */
  protected override applyPanelSize(): void {
    super.applyPanelSize();
    this.scheduleScrollRefresh();
  }

  protected override onOpen(): void {
    this.renderActiveTab();
    this.updateTabStyles();
    this.scheduleScrollRefresh();
  }

  // ---- Tabs -----------------------------------------------------------

  private setActiveTab(tab: CodexTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.scrollY = 0;
    this.renderActiveTab();
    this.updateTabStyles();
    this.scheduleScrollRefresh();
  }

  /** Visually highlight the active tab by tinting its background gold.
   *  mkButton's hover handler clears the tint on pointerout, so we
   *  re-apply here on every render — the active tab stays gold even
   *  after the player mouses off it. */
  private updateTabStyles(): void {
    for (const [tab, btn] of this.tabButtons) {
      const active = tab === this.activeTab;
      btn.background.tint = active ? COLORS.borderActive : 0xffffff;
    }
  }

  // ---- Content rendering ---------------------------------------------

  private renderActiveTab(): void {
    if (!this.scrollContent) return;
    this.scrollContent.removeChildren();
    this.scrollContent.y = 0;

    switch (this.activeTab) {
      case 'mobs':
        for (const kind of MOB_ENTRY_ORDER) {
          if (MOBS[kind].boss) continue;
          this.scrollContent.addChild(this.buildMobCard(kind));
        }
        break;
      case 'bosses':
        for (const kind of MOB_ENTRY_ORDER) {
          if (!MOBS[kind].boss) continue;
          this.scrollContent.addChild(this.buildMobCard(kind));
        }
        break;
      case 'characters':
        for (const archetypeId of ARCHETYPE_ORDER) {
          const avatars = AVATARS_BY_ARCHETYPE[archetypeId] ?? [];
          for (const avatar of avatars) {
            this.scrollContent.addChild(this.buildCharacterCard(avatar));
          }
        }
        break;
    }

    if (this.scrollContent.children.length === 0) {
      this.scrollContent.addChild(mkText(t('codex.empty'), TEXT.muted));
    }
  }

  private buildMobCard(kind: MobKind): LayoutContainer {
    const card = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });
    const mob = MOBS[kind];
    const canon = MOBS_TLOD[kind] ?? null;

    const header = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    header.addChild(mkText(t(`codex.entry.${kind}.name`), TEXT.header));
    if (canon) {
      header.addChild(mkText(canon.location, { ...TEXT.muted, fontStyle: 'italic' }));
    }
    card.addChild(header);

    if (canon) {
      card.addChild(mkText(t('codex.canonHeader'), TEXT.cellLabel));
      card.addChild(
        this.buildStatsRow([
          ['HP', String(canon.hp)],
          [t('codex.stat.atk'), String(canon.pAtk)],
          [t('codex.stat.def'), String(canon.pDef)],
          [t('codex.stat.mat'), String(canon.mAtk)],
          [t('codex.stat.mdf'), String(canon.mDef)],
          [t('codex.stat.spd'), String(canon.speed)],
          ['XP', String(canon.xp)],
          [t('codex.stat.gold'), String(canon.gold)],
          [t('codex.stat.element'), canon.element],
        ]),
      );
    }

    card.addChild(mkText(t('codex.engineHeader'), TEXT.cellLabel));
    card.addChild(
      this.buildStatsRow([
        ['HP', String(mob.health)],
        [t('codex.stat.atk'), String(mob.stats.atk)],
        [t('codex.stat.def'), String(mob.stats.def)],
        [t('codex.stat.mat'), String(mob.stats.magicAtk)],
        [t('codex.stat.mdf'), String(mob.stats.magicDef)],
        [t('codex.stat.spd'), String(mob.stats.speed)],
        ['XP', String(mob.xp)],
      ]),
    );

    return card;
  }

  private buildCharacterCard(avatar: CharacterAvatar): LayoutContainer {
    const card = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });

    const header = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    header.addChild(mkText(t(avatar.displayNameKey), TEXT.header));
    header.addChild(
      mkText(t(`codex.archetype.${avatar.archetype.id}`), {
        ...TEXT.muted,
        fontStyle: 'italic',
      }),
    );
    card.addChild(header);

    card.addChild(
      this.buildStatsRow([
        [t('codex.stat.element'), avatar.archetype.element],
        [t('codex.stat.pattern'), avatar.archetype.attackPattern],
        [t('codex.stat.spMax'), String(avatar.archetype.dragoon.spMax)],
      ]),
    );

    return card;
  }

  /** Compact key/value chip grid — wraps to a second row on narrow
   *  viewports thanks to Yoga's flex-wrap. */
  private buildStatsRow(pairs: ReadonlyArray<readonly [string, string]>): Container {
    const row = new Container({
      layout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.gapSmall,
        width: '100%',
      },
    });
    for (const [label, value] of pairs) {
      const chip = new Container({
        layout: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingLeft: 6,
          paddingRight: 6,
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: COLORS.panelBg,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 4,
        },
      });
      chip.addChild(mkText(label, TEXT.cellLabel));
      chip.addChild(mkText(value, TEXT.cellValue));
      row.addChild(chip);
    }
    return row;
  }
}
