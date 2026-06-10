/**
 * In-game Bestiary — read-only catalogue of every mob the player has
 * vetted against TLoD canon. Opened from the Settings menu (gameplay or
 * title screen), so it doesn't need a gameplay hook. Reads canonical
 * stats from `MOBS_TLOD` (wiki numbers) and the live engine numbers
 * from `MOBS`; both are displayed side by side so a future damage-check
 * pass can spot drift at a glance.
 *
 * Entries are curated, not auto-derived: the `BESTIARY_ENTRIES` list
 * below decides what shows up so partially-integrated mobs (no sprite,
 * stats still TBD) stay hidden until we explicitly add them.
 */
import type { Application } from 'pixi.js';
import { Container } from 'pixi.js';
import type { LayoutContainer } from '@pixi/layout/components';
import { MOBS, type MobKind } from '@data/balance';
import { MOBS_TLOD } from '@data/mobsTLoD';
import { t } from '@services/I18nService';
import { Modal } from './Modal';
import { COLORS, SPACING, TEXT } from './theme';
import { mkCloseButton, mkColumn, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

/** Curated list of mobs visible in the Bestiary. Adding a mob to MOBS
 *  doesn't auto-add it here — we only list entries whose canonical
 *  stats have been verified against the wiki and whose sprite is in.
 *  Order roughly follows TLoD encounter order (Hellena Prison → Forest
 *  → Prison-area boss) so the screen reads like a campaign log. */
const BESTIARY_ENTRIES: ReadonlyArray<MobKind> = [
  'sandoraKnight',
  'berserkMouse',
  'goblin',
  'assassinCock',
  'trent',
  'fruegel',
];

/** Use the full modal height — with 6+ entries the panel needs room
 *  to breathe, and the base Modal clamps against `screen.height -
 *  MODAL.margin` anyway so this is only the desktop ceiling. Mobile
 *  gets whatever the viewport allows. A future scroll wrapper will
 *  remove the clamp problem entirely. */
const PANEL_MAX_HEIGHT = 720;

export class BestiaryPanel extends Modal {
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;

  constructor(app: Application) {
    super(app, 'bestiary-panel');
  }

  protected buildPanel(): LayoutContainer {
    const panel = mkPanel({
      layout: { flex: 1, gap: SPACING.gap, alignItems: 'stretch' },
    });

    // Header strip — centered title + close button on the right.
    const titleStrip = mkRow({
      layout: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 32,
      },
    });
    titleStrip.addChild(new Container({ layout: { width: 28, height: 28, isLeaf: true } }));
    titleStrip.addChild(mkText(t('bestiary.title'), TEXT.title));
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    if (BESTIARY_ENTRIES.length === 0) {
      panel.addChild(mkText(t('bestiary.empty'), TEXT.muted));
      return panel;
    }

    // Scrollable list of mob cards. Yoga gives us flex-1 + overflow:
    // hidden so the list fills the panel and the inner stack is
    // clipped at the bottom. Real scroll behaviour is a follow-up
    // (will probably reuse InventoryPanel's drag-scroll once we
    // extract it); the curated list is short enough that fitting
    // them on screen is fine today.
    const list = mkColumn({
      layout: { width: '100%', flex: 1, gap: SPACING.gap },
    });
    for (const kind of BESTIARY_ENTRIES) {
      list.addChild(this.buildMobCard(kind));
    }
    panel.addChild(list);

    return panel;
  }

  /** One row per mob — name strip + canon stats grid + engine stats
   *  grid. The two grids are intentionally separate so the player can
   *  scan canonical vs runtime values for the damage-check pass. */
  private buildMobCard(kind: MobKind): LayoutContainer {
    const card = mkSubPanel({
      layout: {
        width: '100%',
        gap: SPACING.gapSmall,
        padding: SPACING.pad,
      },
    });

    const mob = MOBS[kind];
    const canon = MOBS_TLOD[kind] ?? null;

    // Header row: mob name + location chip.
    const header = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    header.addChild(mkText(t(`bestiary.${kind}.name`), TEXT.header));
    if (canon) {
      header.addChild(mkText(canon.location, { ...TEXT.muted, fontStyle: 'italic' }));
    }
    card.addChild(header);

    // Canonical stats row — the wiki numbers. Hidden when we don't
    // have a TLoD entry yet (engine-only mob).
    if (canon) {
      card.addChild(mkText(t('bestiary.canonHeader'), TEXT.cellLabel));
      card.addChild(this.buildStatsRow([
        ['HP', String(canon.hp)],
        [t('bestiary.stat.atk'), String(canon.pAtk)],
        [t('bestiary.stat.def'), String(canon.pDef)],
        [t('bestiary.stat.mat'), String(canon.mAtk)],
        [t('bestiary.stat.mdf'), String(canon.mDef)],
        [t('bestiary.stat.spd'), String(canon.speed)],
        ['XP', String(canon.xp)],
        [t('bestiary.stat.gold'), String(canon.gold)],
        [t('bestiary.stat.element'), canon.element],
      ]));
    }

    // Engine stats row — what the live MOBS table actually uses. Lets
    // us spot drift between canon + tuning at a glance.
    card.addChild(mkText(t('bestiary.engineHeader'), TEXT.cellLabel));
    card.addChild(this.buildStatsRow([
      ['HP', String(mob.health)],
      [t('bestiary.stat.atk'), String(mob.stats.atk)],
      [t('bestiary.stat.def'), String(mob.stats.def)],
      [t('bestiary.stat.mat'), String(mob.stats.magicAtk)],
      [t('bestiary.stat.mdf'), String(mob.stats.magicDef)],
      [t('bestiary.stat.spd'), String(mob.stats.speed)],
      ['XP', String(mob.xp)],
    ]));

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
