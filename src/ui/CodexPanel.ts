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
import { ARCHETYPE_ORDER, AVATARS_BY_ARCHETYPE, type CharacterAvatar } from '@data/characters';
import { t } from '@services/I18nService';

import { Modal } from './Modal';
import { COLORS, MODAL, SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

type CodexTab = 'mobs' | 'bosses' | 'characters';

/** Curated list driving the Mobs + Bosses tabs. Split at render time
 *  via `MOBS[kind].boss`. Order roughly follows TLoD encounter order
 *  so the screen reads like a campaign log. */
const MOB_ENTRY_ORDER: ReadonlyArray<MobKind> = [
  'knightOfSandoraSeles',
  'knightOfSandoraKazas',
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
/** Title strip height — fixed in buildPanel. Kept here so the viewport
 *  size calculation in applyPanelSize stays in sync. */
const TITLE_STRIP_HEIGHT = 32;

export class CodexPanel extends Modal {
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;

  private activeTab: CodexTab = 'mobs';
  private readonly tabButtons = new Map<CodexTab, LayoutContainer>();

  // Scroll widget — populated by buildPanel(). Inner content is a
  // LayoutContainer so Yoga handles card stacking + chip wrapping;
  // outer viewport is a regular Container so we can mask + translate.
  // Container.width/height returns the union of child bounds which the
  // mask pollutes (4096×4096); we track the viewport's actual dimensions
  // ourselves, derived from the panel size in applyPanelSize().
  private scrollViewport: Container | null = null;
  private scrollMask: Graphics | null = null;
  private scrollContent: LayoutContainer | null = null;
  private scrollY = 0;
  private viewportHeight = 0;

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
    // Generous initial rect so the mask is non-empty before applyPanelSize
    // gets a chance to measure the laid-out viewport. An empty Graphics
    // mask hides everything; the modal would open visibly empty for a
    // frame (or persistently when the resize tick races the first render
    // — what was happening in the wild). We resize the rect to the actual
    // viewport dimensions on every applyPanelSize call.
    mask.rect(0, 0, 4096, 4096).fill(0xffffff);
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
    if (!this.scrollContent) return;
    // viewportHeight is what we computed from the panel size — see
    // applyPanelSize. Container.height would give us the wrong value
    // because the 4096×4096 mask is a child of the viewport.
    const contentH = this.scrollContent.height || 0;
    const minY = Math.min(0, this.viewportHeight - contentH);
    const maxY = 0;
    this.scrollY = Math.max(minY, Math.min(maxY, targetY));
    this.scrollContent.y = this.scrollY;
  }

  /** Resize the mask, push explicit dimensions onto the viewport + the
   *  inner content, then clamp the scroll position. Called by the base
   *  Modal on every viewport resize AND on open so the codex stays
   *  usable across orientation changes.
   *
   *  We mirror Modal.applyPanelSize's panel-size formula instead of
   *  reading laid-out dimensions back from Pixi:
   *    - Container.width/height is bounds-based and the mask pollutes it.
   *    - @pixi/layout computed values aren't trivially exposed and need
   *      one render frame to populate.
   *  Computing inline keeps the refresh synchronous → mask is correct
   *  on the very first frame, no empty-content flash. */
  protected override applyPanelSize(): void {
    super.applyPanelSize();

    const panelW = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const panelH = Math.min(this.panelMaxHeight, this.app.screen.height - MODAL.margin);
    // Panel inner box = panel size - 2 × padding. Subtract header strip
    // + tab strip + the two flex-gap spacers between the three sections.
    const innerW = Math.max(0, panelW - 2 * SPACING.pad);
    const innerH = Math.max(
      0,
      panelH - 2 * SPACING.pad - TITLE_STRIP_HEIGHT - TAB_HEIGHT - 2 * SPACING.gap,
    );
    this.viewportHeight = innerH;

    if (this.scrollViewport) {
      // Push explicit dims onto the viewport so Yoga sizes the panel
      // child slot to exactly this rectangle (no flex stretch race
      // with the mask pollution). The viewport is a regular Container
      // so its children — mask + content — aren't laid out by Yoga;
      // we position them ourselves.
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
      // Force content width so cards using `width: 100%` actually get
      // viewportWidth and not zero (no LayoutContainer ancestor).
      this.scrollContent.layout = {
        ...(this.scrollContent.layout?.style ?? {}),
        width: innerW,
      };
    }
    this.applyScroll(this.scrollY);
  }

  protected override onOpen(): void {
    this.renderActiveTab();
    this.updateTabStyles();
    // Content height needs Yoga to have measured the freshly added
    // cards — defer the clamp by one tick so the bottom-edge stop
    // accounts for the actual layout.
    this.app.ticker.addOnce(() => this.applyScroll(this.scrollY), this);
  }

  // ---- Tabs -----------------------------------------------------------

  private setActiveTab(tab: CodexTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.scrollY = 0;
    this.renderActiveTab();
    this.updateTabStyles();
    // Defer the clamp one tick so the new cards' heights are measured.
    this.app.ticker.addOnce(() => this.applyScroll(0), this);
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
    // Location is the only thing we still pull from MOBS_TLOD — every
    // other stat shown in the card is the engine-actual value from
    // MOBS so the Codex reflects what the player is fighting, not the
    // PS1 reference we cross-checked against.
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

    // Full engine stat block. Grouped roughly by combat relevance so a
    // glance reads "vitals → offence → defence → action-RPG dials":
    //   - vitals: HP / XP / Element / boss flag
    //   - combat: AT / DF / MAT / MDF
    //   - hit/avoid: A-HIT / A-AV / M-HIT / M-AV (matter now that the
    //     hit-roll system reads them)
    //   - action-RPG: SPD (turn-order canon), atkSpeed (a/s),
    //     range / aggroRange (px), world speed (px/ms)
    card.addChild(
      this.buildStatsRow([
        ['HP', String(mob.health)],
        ['XP', String(mob.xp)],
        [t('codex.stat.element'), mob.element],
        ...(mob.boss ? ([[t('codex.stat.boss'), '★']] as Array<[string, string]>) : []),
        [t('codex.stat.atk'), String(mob.stats.atk)],
        [t('codex.stat.def'), String(mob.stats.def)],
        [t('codex.stat.mat'), String(mob.stats.magicAtk)],
        [t('codex.stat.mdf'), String(mob.stats.magicDef)],
        [t('codex.stat.aHit'), `${mob.stats.attackHit}%`],
        [t('codex.stat.aAv'), `${mob.stats.attackAvoid}%`],
        [t('codex.stat.mHit'), `${mob.stats.magicHit}%`],
        [t('codex.stat.mAv'), `${mob.stats.magicAvoid}%`],
        [t('codex.stat.spd'), String(mob.stats.speed)],
        [t('codex.stat.atkSpeed'), `${mob.stats.atkSpeed}/s`],
        [t('codex.stat.range'), `${mob.stats.range}px`],
        [t('codex.stat.aggroRange'), `${mob.stats.aggroRange}px`],
        [t('codex.stat.moveSpeed'), `${mob.speed} px/ms`],
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
