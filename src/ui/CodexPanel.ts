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
 * Scrolling delegated to the shared `ScrollableArea` helper (the
 * Training mob picker uses the same one), so the two pickers stay
 * in lockstep on fixes / polish.
 *
 * Entry curation lives in `MOB_ENTRY_ORDER` (mob/boss tabs) — adding
 * a mob to MOBS doesn't auto-list it; we promote here once stats are
 * vetted. Character tab iterates ARCHETYPE_ORDER + AVATARS_BY_ARCHETYPE
 * so every playable face shows up automatically.
 */
import type { Application } from 'pixi.js';
import { Container } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';

import { MOBS, type MobKind } from '@data/balance';
import { MOBS_TLOD } from '@data/mobsTLoD';
import { ARCHETYPE_ORDER, AVATARS_BY_ARCHETYPE, type CharacterAvatar } from '@data/characters';
import { ELEMENT_COLOR, type Element } from '@data/elements';
import { t } from '@services/I18nService';

import { Modal } from './Modal';
import { ScrollableArea } from './ScrollableArea';
import { COLORS, MODAL, SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

type CodexTab = 'mobs' | 'bosses' | 'characters';

/** Curated list driving the Mobs + Bosses tabs. Split at render time
 *  via `MOBS[kind].boss`. Order roughly follows TLoD encounter order
 *  so the screen reads like a campaign log. */
const MOB_ENTRY_ORDER: ReadonlyArray<MobKind> = [
  'knightOfSandoraSeles',
  'knightOfSandoraKazas',
  'commanderSeles',
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
  /** Master/detail selection — non-null = render the detail view for
   *  this entry, null = render the compact list for the active tab.
   *  Cleared whenever the tab switches so each tab opens at its list
   *  view. Only one of the two is ever non-null at a time. */
  private selectedMobKind: MobKind | null = null;
  private selectedAvatar: CharacterAvatar | null = null;

  /** Vertical scroll widget — shared helper, also used by the Training
   *  mob picker. addChild rows / cards to `scroll.content`; setSize
   *  from applyPanelSize; scrollToTop on navigation; reclamp one tick
   *  after content changes for Yoga to settle. */
  private readonly scroll = new ScrollableArea();

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
    // Set gap larger than the helper default since cards (not rows)
    // breathe better with the standard panel gap.
    this.scroll.content.layout = {
      ...(this.scroll.content.layout?.style ?? {}),
      gap: SPACING.gap,
    };
    panel.addChild(this.scroll.container);

    return panel;
  }

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
    this.scroll.setSize(innerW, innerH);
  }

  protected override onOpen(): void {
    this.renderActiveTab();
    this.updateTabStyles();
    // Content height needs Yoga to have measured the freshly added
    // cards — defer the clamp by one tick so the bottom-edge stop
    // accounts for the actual layout.
    this.app.ticker.addOnce(() => this.scroll.reclamp(), this);
  }

  // ---- Tabs -----------------------------------------------------------

  private setActiveTab(tab: CodexTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    // Always drop back to the list view when switching tabs — tapping
    // a tab is conceptually "start fresh in this section".
    this.selectedMobKind = null;
    this.selectedAvatar = null;
    this.renderActiveTab();
    this.updateTabStyles();
    // Defer the clamp one tick so the new cards' heights are measured.
    this.app.ticker.addOnce(() => this.scroll.scrollToTop(), this);
  }

  /** Drill into a mob's detail view from the list. */
  private openMobDetail(kind: MobKind): void {
    this.selectedMobKind = kind;
    this.selectedAvatar = null;

    this.renderActiveTab();
    this.app.ticker.addOnce(() => this.scroll.scrollToTop(), this);
  }

  /** Drill into a character's detail view from the list. */
  private openCharacterDetail(avatar: CharacterAvatar): void {
    this.selectedAvatar = avatar;
    this.selectedMobKind = null;

    this.renderActiveTab();
    this.app.ticker.addOnce(() => this.scroll.scrollToTop(), this);
  }

  /** Back to the current tab's list view. */
  private clearSelection(): void {
    this.selectedMobKind = null;
    this.selectedAvatar = null;

    this.renderActiveTab();
    this.app.ticker.addOnce(() => this.scroll.scrollToTop(), this);
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
    this.scroll.content.removeChildren();
    this.scroll.scrollToTop();

    // Detail view takes precedence — when an entry is selected, the
    // scroll content is the back strip + the full card and nothing
    // else. Clearing the selection (via the back button or a tab
    // switch) drops back to the list.
    if (this.selectedMobKind) {
      this.scroll.content.addChild(this.buildBackStrip());
      this.scroll.content.addChild(this.buildMobCard(this.selectedMobKind));
      return;
    }
    if (this.selectedAvatar) {
      this.scroll.content.addChild(this.buildBackStrip());
      this.scroll.content.addChild(this.buildCharacterCard(this.selectedAvatar));
      return;
    }

    // List view — one compact tappable row per entry. Building rows
    // instead of full cards keeps the Pixi node count low even when
    // the codex eventually holds 80+ entries.
    switch (this.activeTab) {
      case 'mobs':
        for (const kind of MOB_ENTRY_ORDER) {
          if (MOBS[kind].boss) continue;
          this.scroll.content.addChild(this.buildMobListRow(kind));
        }
        break;
      case 'bosses':
        for (const kind of MOB_ENTRY_ORDER) {
          if (!MOBS[kind].boss) continue;
          this.scroll.content.addChild(this.buildMobListRow(kind));
        }
        break;
      case 'characters':
        for (const archetypeId of ARCHETYPE_ORDER) {
          const avatars = AVATARS_BY_ARCHETYPE[archetypeId] ?? [];
          for (const avatar of avatars) {
            this.scroll.content.addChild(this.buildCharacterListRow(avatar));
          }
        }
        break;
    }

    if (this.scroll.content.children.length === 0) {
      this.scroll.content.addChild(mkText(t('codex.empty'), TEXT.muted));
    }
  }

  /** Back-to-list strip rendered above any detail card. Full-width
   *  tappable row with a "← Back" label; tinting on hover mirrors the
   *  list row treatment so the affordance reads consistently. */
  private buildBackStrip(): LayoutContainer {
    const strip = new LayoutContainer({
      label: 'codex-back-strip',
      layout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.gapSmall,
        width: '100%',
        height: 36,
        paddingLeft: SPACING.pad,
        paddingRight: SPACING.pad,
        backgroundColor: COLORS.buttonBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    });
    strip.addChild(
      mkText(t('codex.back'), { ...TEXT.value, fill: COLORS.borderActive, fontSize: 14 }),
    );
    strip.eventMode = 'static';
    strip.cursor = 'pointer';
    strip.on('pointertap', () => this.clearSelection());
    strip.on('pointerover', () => {
      strip.background.tint = COLORS.borderActive;
    });
    strip.on('pointerout', () => {
      strip.background.tint = 0xffffff;
    });
    return strip;
  }

  /** Compact list row for a mob — tappable, drills into the detail
   *  view. Layout: name (+ location chip), element badge, HP chip.
   *  Sits at a comfortable 56 px tall so it passes mobile thumb taps
   *  while staying compact enough to fit ~10 rows on a phone screen. */
  private buildMobListRow(kind: MobKind): LayoutContainer {
    const mob = MOBS[kind];
    const canon = MOBS_TLOD[kind] ?? null;
    const row = new LayoutContainer({
      label: `codex-mob-row-${kind}`,
      layout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.gap,
        width: '100%',
        height: 56,
        paddingLeft: SPACING.pad,
        paddingRight: SPACING.pad,
        backgroundColor: COLORS.subPanelBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    });

    // Left: name + (optional) location, stacked vertically.
    const nameCol = new Container({
      layout: { flexDirection: 'column', flex: 1, gap: 2 },
    });
    nameCol.addChild(mkText(t(`codex.entry.${kind}.name`), TEXT.header));
    if (canon) {
      nameCol.addChild(mkText(canon.location, { ...TEXT.muted, fontSize: 11 }));
    }
    row.addChild(nameCol);

    // Right: HP chip + element badge + boss ★ (if applicable).
    if (mob.boss) row.addChild(this.buildBossBadge());
    row.addChild(this.buildElementBadge(mob.element));
    row.addChild(this.buildVitalChip('HP', String(mob.health)));

    this.makeRowInteractive(row, () => this.openMobDetail(kind));
    return row;
  }

  /** Compact list row for a playable character — tappable, drills
   *  into the detail view. Layout: name (+ archetype small),
   *  element badge. */
  private buildCharacterListRow(avatar: CharacterAvatar): LayoutContainer {
    const row = new LayoutContainer({
      label: `codex-char-row-${avatar.id}`,
      layout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.gap,
        width: '100%',
        height: 56,
        paddingLeft: SPACING.pad,
        paddingRight: SPACING.pad,
        backgroundColor: COLORS.subPanelBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    });

    const nameCol = new Container({
      layout: { flexDirection: 'column', flex: 1, gap: 2 },
    });
    nameCol.addChild(mkText(t(avatar.displayNameKey), TEXT.header));
    nameCol.addChild(
      mkText(t(`codex.archetype.${avatar.archetype.id}`), { ...TEXT.muted, fontSize: 11 }),
    );
    row.addChild(nameCol);
    row.addChild(this.buildElementBadge(avatar.archetype.element));

    this.makeRowInteractive(row, () => this.openCharacterDetail(avatar));
    return row;
  }

  /** Common interactivity wiring for list rows — pointer cursor,
   *  hover tint, tap callback. Extracted so any list row sub-type
   *  (future items / magic / npcs) gets the same affordance. */
  private makeRowInteractive(row: LayoutContainer, onTap: () => void): void {
    row.eventMode = 'static';
    row.cursor = 'pointer';
    row.on('pointertap', onTap);
    row.on('pointerover', () => {
      row.background.tint = COLORS.borderActive;
    });
    row.on('pointerout', () => {
      row.background.tint = 0xffffff;
    });
  }

  private buildMobCard(kind: MobKind): LayoutContainer {
    const card = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gap, padding: SPACING.pad },
    });
    const mob = MOBS[kind];
    // Location is the only thing we still pull from MOBS_TLOD — every
    // other stat shown in the card is the engine-actual value from
    // MOBS so the Codex reflects what the player is fighting.
    const canon = MOBS_TLOD[kind] ?? null;

    // --- Header: name + (optional) location ----------------------------
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

    // --- Vitals strip: HP / XP big + Element badge + boss star ---------
    const vitals = mkRow({
      layout: {
        width: '100%',
        gap: SPACING.gap,
        alignItems: 'center',
        flexWrap: 'wrap',
      },
    });
    vitals.addChild(this.buildVitalChip('HP', String(mob.health)));
    vitals.addChild(this.buildVitalChip('XP', String(mob.xp)));
    vitals.addChild(this.buildElementBadge(mob.element));
    if (mob.boss) vitals.addChild(this.buildBossBadge());
    card.addChild(vitals);

    // --- Three stat groups in a responsive row -------------------------
    // Yoga wraps the row to a column when the panel narrows (typical
    // mobile portrait). Each group is a sub-panel with a header + a
    // tight 2-column label/value table.
    const groups = mkRow({
      layout: {
        width: '100%',
        gap: SPACING.gap,
        flexWrap: 'wrap',
        alignItems: 'stretch',
      },
    });
    groups.addChild(
      this.buildStatGroup(t('codex.group.combat'), [
        [t('codex.stat.atk'), String(mob.stats.atk)],
        [t('codex.stat.def'), String(mob.stats.def)],
        [t('codex.stat.mat'), String(mob.stats.magicAtk)],
        [t('codex.stat.mdf'), String(mob.stats.magicDef)],
      ]),
    );
    groups.addChild(
      this.buildStatGroup(t('codex.group.precision'), [
        [t('codex.stat.aHit'), `${mob.stats.attackHit}%`],
        [t('codex.stat.aAv'), `${mob.stats.attackAvoid}%`],
        [t('codex.stat.mHit'), `${mob.stats.magicHit}%`],
        [t('codex.stat.mAv'), `${mob.stats.magicAvoid}%`],
      ]),
    );
    groups.addChild(
      this.buildStatGroup(t('codex.group.action'), [
        [t('codex.stat.spd'), String(mob.stats.speed)],
        [t('codex.stat.atkSpeed'), `${mob.stats.atkSpeed}/s`],
        [t('codex.stat.range'), `${mob.stats.range}px`],
        [t('codex.stat.aggroRange'), `${mob.stats.aggroRange}px`],
        [t('codex.stat.moveSpeed'), `${mob.speed}`],
      ]),
    );
    card.addChild(groups);

    return card;
  }

  /** Big-number vital chip — HP / XP. Larger value text than the
   *  generic stat rows so the most important number reads at a glance.
   *  Sits in the vitals strip alongside the element badge. */
  private buildVitalChip(label: string, value: string): LayoutContainer {
    const chip = new LayoutContainer({
      layout: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: COLORS.panelBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    });
    chip.addChild(mkText(label, { ...TEXT.cellLabel, fontSize: 12 }));
    chip.addChild(mkText(value, { ...TEXT.value, fontSize: 18 }));
    return chip;
  }

  /** Coloured element pill — small swatch tinted with ELEMENT_COLOR
   *  next to the element name. Color is decorative only; the label is
   *  kept on the panel background so it stays legible regardless of
   *  the tint (Light's pale yellow would erase white text otherwise). */
  private buildElementBadge(element: Element): LayoutContainer {
    const chip = new LayoutContainer({
      layout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: COLORS.panelBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 6,
      },
    });
    const swatch = new LayoutContainer({
      layout: {
        width: 12,
        height: 12,
        backgroundColor: ELEMENT_COLOR[element],
        borderRadius: 6,
      },
    });
    chip.addChild(swatch);
    chip.addChild(mkText(t(`codex.element.${element}`), { ...TEXT.value, fontSize: 13 }));
    return chip;
  }

  /** Gold star pill — only renders for entries flagged `boss: true`. */
  private buildBossBadge(): LayoutContainer {
    const chip = new LayoutContainer({
      layout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: COLORS.panelBg,
        borderColor: COLORS.borderActive,
        borderWidth: 1,
        borderRadius: 6,
      },
    });
    chip.addChild(mkText('★', { fill: COLORS.gold, fontSize: 14, fontWeight: 'bold' }));
    chip.addChild(mkText(t('codex.stat.boss'), { ...TEXT.value, fontSize: 12 }));
    return chip;
  }

  /** One stat group sub-panel — small header + 2-column label/value
   *  table. `minWidth + flex: 1` lets the parent flex row balance the
   *  three groups on desktop while flex-wrap drops them to one column
   *  per row on narrow viewports. */
  private buildStatGroup(
    title: string,
    pairs: ReadonlyArray<readonly [string, string]>,
  ): LayoutContainer {
    const group = mkSubPanel({
      layout: {
        flexDirection: 'column',
        gap: SPACING.gapSmall,
        flex: 1,
        minWidth: 140,
        padding: SPACING.pad,
      },
    });
    group.addChild(
      mkText(title, {
        ...TEXT.cellLabel,
        fill: COLORS.borderActive,
        fontSize: 11,
      }),
    );
    for (const [label, value] of pairs) {
      const row = mkRow({
        layout: {
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: SPACING.gapSmall,
        },
      });
      row.addChild(mkText(label, TEXT.cellLabel));
      row.addChild(mkText(value, TEXT.cellValue));
      group.addChild(row);
    }
    return group;
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
