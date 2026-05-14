import type { Application } from 'pixi.js';
import { Container } from 'pixi.js';
import type { LayoutContainer } from '@pixi/layout/components';
import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { getCharacterStatsAtLevel } from '@data/characters';
import { EQUIPMENT, totalEquipmentBonuses, type EquipmentSlot } from '@data/equipment';
import { t } from '@services/I18nService';
import { Modal } from './Modal';
import { SPACING, TEXT } from './theme';
import { mkCloseButton, mkColumn, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

/**
 * Read-only TLoD-style character status overlay — page 1 of the
 * future in-game menu (Inventory / Magic / Equipment / Status /
 * Save / …). Faithful to the PS1 status screen:
 *
 *   - identity + vitals (LV, D'LV, SP, HP, MP, EXP)
 *   - equipped items (weapon / helmet / armor / boots / ring)
 *   - Body / Weapon / Total / Dragoon stats table
 *   - Dragoon Magic list with MP costs
 *
 * Builds on Modal for the dim backdrop + open/close/resize boiler-
 * plate, on `@pixi/layout` (Yoga flexbox) for the responsive
 * 2 × 2 → 1-column grid, on `mkText` / `mkSubPanel` for layout-aware
 * leaves, and on `theme.ts` for every color + text style.
 */

const STAT_ROWS: ReadonlyArray<{
  key: 'at' | 'df' | 'mat' | 'mdf' | 'speed' | 'aHit' | 'mHit' | 'aAv' | 'mAv';
  pct: boolean;
  affectedByDragoon: boolean;
}> = [
  { key: 'at', pct: false, affectedByDragoon: true },
  { key: 'df', pct: false, affectedByDragoon: true },
  { key: 'mat', pct: false, affectedByDragoon: true },
  { key: 'mdf', pct: false, affectedByDragoon: true },
  { key: 'speed', pct: false, affectedByDragoon: false },
  { key: 'aHit', pct: true, affectedByDragoon: false },
  { key: 'mHit', pct: true, affectedByDragoon: false },
  { key: 'aAv', pct: true, affectedByDragoon: false },
  { key: 'mAv', pct: true, affectedByDragoon: false },
];

const EQUIPMENT_SLOTS: ReadonlyArray<EquipmentSlot> = [
  'weapon',
  'helmet',
  'armor',
  'boots',
  'ring',
];

export class StatusPanel extends Modal {
  private readonly world: World<Components>;
  private readonly getPlayerId: () => Entity | null;
  /** Slot inside the panel that holds the live state. Rebuilt on
   *  every `open()` so the snapshot matches the current ECS state. */
  private contentSlot: Container | null = null;

  constructor(app: Application, world: World<Components>, getPlayerId: () => Entity | null) {
    super(app, 'status-panel');
    this.world = world;
    this.getPlayerId = getPlayerId;
  }

  protected buildPanel(): LayoutContainer {
    // Outer panel shell — frame + close button strip + a flex-1
    // content slot that the onOpen() hook fills with the live state.
    const panel = mkPanel({ layout: { flex: 1 } });

    const titleStrip = mkRow({
      layout: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        height: 28,
      },
    });
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    this.contentSlot = mkColumn({
      layout: { width: '100%', flex: 1, gap: SPACING.gap },
    });
    panel.addChild(this.contentSlot);

    return panel;
  }

  protected override onOpen(): void {
    if (!this.contentSlot) return;
    this.contentSlot.removeChildren();
    const playerId = this.getPlayerId();
    if (playerId === null) {
      this.contentSlot.addChild(mkText(t('status.noPlayer'), TEXT.label));
      return;
    }

    // Responsive 2 × 2 grid that wraps to a single column on narrow
    // viewports. Yoga's flex-wrap fires automatically when two
    // sub-panels at `minWidth` no longer fit side by side.
    const grid = new Container({
      layout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.gap,
        width: '100%',
      },
    });
    this.contentSlot.addChild(grid);

    grid.addChild(this.buildIdentityPanel(playerId));
    grid.addChild(this.buildEquipmentPanel(playerId));
    grid.addChild(this.buildStatsTable(playerId));
    grid.addChild(this.buildMagicPanel(playerId));
  }

  // ---------- Sub-panel builders ----------------------------------------

  private buildIdentityPanel(playerId: Entity): LayoutContainer {
    const panel = this.responsiveSubPanel();
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    const hp = this.world.getComponent(playerId, 'Health');
    const sp = this.world.getComponent(playerId, 'SpGauge');
    if (!character || !prog || !hp || !sp) return panel;

    const name = t(character.avatar.displayNameKey);
    // D'LV placeholder — VISION §6.2 DLV system not shipped yet.
    const dlv = 1;
    // MP placeholder — VISION §6.4 MpGauge component not shipped.
    const mpCur = 0;
    const mpMax = 0;

    panel.addChild(mkText(`${name}    LV ${prog.level}`, TEXT.title));
    panel.addChild(rowKV("D'LV", `${dlv}    SP ${Math.floor(sp.current)}`));
    panel.addChild(rowKV('HP', `${Math.floor(hp.current)} / ${hp.max}`));
    panel.addChild(rowKV('MP', `${mpCur} / ${mpMax}`));
    panel.addChild(rowKV('EXP', `${prog.xp} / ${prog.xpToNext}`));
    return panel;
  }

  private buildEquipmentPanel(playerId: Entity): LayoutContainer {
    const panel = this.responsiveSubPanel();
    const character = this.world.getComponent(playerId, 'Character');
    if (!character) return panel;

    const equipped: Partial<Record<EquipmentSlot, string>> = {};
    for (const slug of character.avatar.startingEquipment ?? []) {
      const def = EQUIPMENT[slug];
      equipped[def.slot] = def.name;
    }

    panel.addChild(mkText(t('status.equipment'), TEXT.header));
    for (const slot of EQUIPMENT_SLOTS) {
      const name = equipped[slot];
      panel.addChild(mkText(name ?? '—', name ? TEXT.value : TEXT.muted));
    }
    return panel;
  }

  private buildStatsTable(playerId: Entity): LayoutContainer {
    const panel = this.responsiveSubPanel();
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    if (!character || !prog) return panel;

    const archetype = character.avatar.archetype;
    const row = getCharacterStatsAtLevel(archetype, prog.level);
    const baseAction = archetype.actionStats.base;
    const eq = totalEquipmentBonuses(character.avatar.startingEquipment, archetype.id);
    const mult = archetype.dragoon.statsMultiplier;

    const body: Record<string, number> = {
      at: row.atk,
      df: row.def,
      mat: row.magicAtk,
      mdf: row.magicDef,
      speed: baseAction.speed,
      aHit: baseAction.attackHit,
      mHit: baseAction.magicHit,
      aAv: baseAction.attackAvoid,
      mAv: baseAction.magicAvoid,
    };
    const weapon: Record<string, number> = {
      at: eq.atk,
      df: eq.def,
      mat: eq.magicAtk,
      mdf: eq.magicDef,
      speed: eq.speed,
      aHit: eq.attackHit,
      mHit: eq.magicHit,
      aAv: eq.attackAvoid,
      mAv: eq.magicAvoid,
    };
    const dragoonMult: Record<string, number | null> = {
      at: mult.atk,
      df: mult.def,
      mat: mult.magicAtk,
      mdf: mult.magicDef,
      speed: null,
      aHit: null,
      mHit: null,
      aAv: null,
      mAv: null,
    };

    panel.addChild(buildStatHeaderRow());
    for (const r of STAT_ROWS) {
      panel.addChild(
        buildStatRow(
          t(`status.stat.${r.key}`),
          body[r.key] ?? 0,
          weapon[r.key] ?? 0,
          dragoonMult[r.key] ?? null,
          r.pct,
          r.affectedByDragoon,
        ),
      );
    }
    return panel;
  }

  private buildMagicPanel(playerId: Entity): LayoutContainer {
    const panel = this.responsiveSubPanel();
    const character = this.world.getComponent(playerId, 'Character');
    if (!character) return panel;

    const archetype = character.avatar.archetype;
    const spells = Array.from(archetype.dragoon.additionUnlocksByLevel.entries()).sort(
      ([a], [b]) => a - b,
    );

    panel.addChild(rowKV(t('status.magic'), t('status.mp'), { headerStyle: true }));

    if (spells.length === 0) {
      panel.addChild(mkText(t('status.magic.none'), { ...TEXT.cellMuted, fontStyle: 'italic' }));
      return panel;
    }

    spells.slice(0, 4).forEach(([dlv, slug], i) => {
      void dlv;
      const row = mkRow({
        layout: { justifyContent: 'space-between', width: '100%' },
      });
      const left = mkRow({ layout: { gap: 6 } });
      left.addChild(mkText(`${i + 1}`, TEXT.cellLabel));
      left.addChild(mkText(prettifySlug(slug), TEXT.cellValue));
      row.addChild(left);
      // MP cost placeholder — pending spell registry.
      row.addChild(mkText('—', TEXT.cellMuted));
      panel.addChild(row);
    });
    return panel;
  }

  /** A sub-panel that grows in a 2-column flex and wraps to a single
   *  column when the parent narrows below `MODAL.subPanelMinWidth × 2`.
   *  Encapsulates the responsive layout knobs in one place. */
  private responsiveSubPanel(): LayoutContainer {
    return mkSubPanel({
      layout: {
        flexBasis: '48%',
        minWidth: 280,
        flexGrow: 1,
      },
    });
  }
}

// --- Shared row builders (module-level so they don't capture `this`) -----

/** Label / value pair laid out as a flex row, label left, value right. */
function rowKV(label: string, value: string, opts: { headerStyle?: boolean } = {}): Container {
  const row = mkRow({
    layout: { justifyContent: 'space-between', width: '100%' },
  });
  const labelStyle = opts.headerStyle ? TEXT.header : TEXT.label;
  const valueStyle = opts.headerStyle ? TEXT.header : TEXT.value;
  row.addChild(mkText(label, labelStyle));
  row.addChild(mkText(value, valueStyle));
  return row;
}

/** Header row of the stats table — empty label cell + four column
 *  titles (Body / Weapon / Total / Dragoon). */
function buildStatHeaderRow(): Container {
  const row = mkRow({ layout: { width: '100%', gap: 4 } });
  row.addChild(new Container({ layout: { flexBasis: '28%' } }));
  for (const col of ['body', 'weapon', 'total', 'dragoon'] as const) {
    const cell = mkColumn({
      layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
    });
    cell.addChild(mkText(t(`status.col.${col}`), TEXT.cellLabel));
    row.addChild(cell);
  }
  return row;
}

/** One data row of the stats table — label + 4 columns (Body /
 *  Weapon / Total / Dragoon). Hit/avoid stats (`pct`) leave Body
 *  blank, matching the TLoD canon screen layout. */
function buildStatRow(
  label: string,
  bodyVal: number,
  weaponVal: number,
  dragoonMult: number | null,
  pct: boolean,
  affectedByDragoon: boolean,
): Container {
  const row = mkRow({ layout: { width: '100%', gap: 4 } });
  const total = bodyVal + weaponVal;
  const suffix = pct ? '%' : '';

  const labelCell = mkColumn({
    layout: { flexBasis: '28%', justifyContent: 'flex-start' },
  });
  labelCell.addChild(mkText(label, TEXT.cellLabel));
  row.addChild(labelCell);

  const bodyCell = mkColumn({
    layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
  });
  if (!pct) bodyCell.addChild(mkText(String(bodyVal), TEXT.cellValue));
  row.addChild(bodyCell);

  const weaponCell = mkColumn({
    layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
  });
  weaponCell.addChild(
    mkText(weaponVal === 0 && pct ? '0%' : `${weaponVal}${suffix}`, TEXT.cellValue),
  );
  row.addChild(weaponCell);

  const totalCell = mkColumn({
    layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
  });
  totalCell.addChild(mkText(`${total}${suffix}`, TEXT.cellValue));
  row.addChild(totalCell);

  const dragoonCell = mkColumn({
    layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
  });
  if (affectedByDragoon && dragoonMult !== null) {
    dragoonCell.addChild(mkText(`${Math.round(dragoonMult * 100)}%`, TEXT.cellValue));
  } else {
    dragoonCell.addChild(mkText('—', TEXT.cellMuted));
  }
  row.addChild(dragoonCell);

  return row;
}

/** Turn 'wingBlaster' / 'gatesOfHeaven' into 'Wing Blaster' / 'Gates Of
 *  Heaven' until an i18n table for spell slugs ships. */
function prettifySlug(slug: string): string {
  return slug
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
