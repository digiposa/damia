import type { Application } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { getCharacterStatsAtLevel } from '@data/characters';
import { EQUIPMENT, totalEquipmentBonuses, type EquipmentSlot } from '@data/equipment';
import { t } from '@services/I18nService';

/**
 * Read-only character status overlay — page 1 of the future TLoD-style
 * in-game menu (Inventory / Magic / Equipment / Status / Save / …).
 * Layout faithful to the PS1 status screen: 2 × 2 panel grid
 *   - identity + vitals (LV, D'LV, SP, HP, MP, EXP)
 *   - equipped items (weapon / helmet / armor / boots / ring)
 *   - Body / Weapon / Total / Dragoon stats table
 *   - Dragoon Magic list with MP costs
 *
 * Built on `@pixi/layout` (Yoga-powered flexbox). Sub-panel sizing,
 * 2-column → 1-column wrap on narrow viewports, gap spacing, padding
 * are all handled by Yoga — no manual reflow on resize.
 */

const COLOR_BG = 0x1a1f2b;
const COLOR_SUBPANEL_BG = 0x0e1320;
const COLOR_BORDER = 0xa08050;
const COLOR_LABEL = 0xccd2dd;
const COLOR_VALUE = 0xffffff;
const COLOR_MUTED = 0x808a9a;

const PAD = 10;
const GAP = 10;
const MAX_PANEL_WIDTH = 700;
const MAX_PANEL_HEIGHT = 720;
/** Min width before the 2-column grid wraps to single column. Tunes
 *  the breakpoint — Yoga checks `subPanel.minWidth × 2 + gap` against
 *  the row's available width and wraps when it doesn't fit. */
const SUBPANEL_MIN_WIDTH = 280;

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

const labelStyle = { fill: COLOR_LABEL, fontSize: 13 } as const;
const valueStyle = { fill: COLOR_VALUE, fontSize: 14, fontWeight: 'bold' } as const;
const headerStyle = { fill: COLOR_VALUE, fontSize: 14, fontWeight: 'bold' } as const;
const titleStyle = { fill: COLOR_VALUE, fontSize: 18, fontWeight: 'bold' } as const;
const mutedStyle = { fill: COLOR_MUTED, fontSize: 13 } as const;
const cellLabelStyle = { fill: COLOR_LABEL, fontSize: 12, fontWeight: 'bold' } as const;
const cellValueStyle = { fill: COLOR_VALUE, fontSize: 12 } as const;
const cellMutedStyle = { fill: COLOR_MUTED, fontSize: 12 } as const;

export class StatusPanel {
  readonly container: Container;
  private readonly app: Application;
  private readonly world: World<Components>;
  private readonly getPlayerId: () => Entity | null;
  private readonly dim: Graphics;
  /** Panel root — rebuilt on every open() so live ECS state shows. */
  private panel: LayoutContainer | null = null;
  private isOpen_ = false;
  private readonly cleanups: Array<() => void> = [];

  constructor(app: Application, world: World<Components>, getPlayerId: () => Entity | null) {
    this.app = app;
    this.world = world;
    this.getPlayerId = getPlayerId;
    this.container = new Container({ label: 'status-panel' });
    this.container.visible = false;

    this.dim = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    this.dim.eventMode = 'static';
    this.container.addChild(this.dim);

    const onResize = (): void => {
      this.dim
        .clear()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000, alpha: 0.7 });
      // Yoga re-lays out automatically when we re-set the layout
      // width/height — re-applied on every open() but we also nudge
      // it here so a resize while-open keeps the panel sane.
      this.applyPanelSize();
    };
    app.renderer.on('resize', onResize);
    this.cleanups.push(() => app.renderer.off('resize', onResize));
  }

  open(): void {
    this.rebuildContent();
    this.container.visible = true;
    this.isOpen_ = true;
    // Raise above any overlay that was addChild'd after us
    // (SurvivalHUD, touch buttons, joystick, …). Same pattern as
    // SettingsPanel / InventoryPanel / LevelUpChoiceModal.
    const parent = this.container.parent;
    if (parent) parent.setChildIndex(this.container, parent.children.length - 1);
  }

  close(): void {
    this.container.visible = false;
    this.isOpen_ = false;
  }

  get isOpen(): boolean {
    return this.isOpen_;
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups.length = 0;
    this.container.destroy({ children: true });
  }

  /** Compute and set the panel size based on the current viewport.
   *  Yoga's flex-wrap + minWidth handles the 2-column → 1-column
   *  responsive breakpoint inside; this only sizes the outer box. */
  private applyPanelSize(): void {
    if (!this.panel) return;
    const margin = 20;
    const w = Math.min(MAX_PANEL_WIDTH, this.app.screen.width - margin);
    const h = Math.min(MAX_PANEL_HEIGHT, this.app.screen.height - margin);
    this.panel.layout = {
      ...(this.panel.layout?.style ?? {}),
      width: w,
      height: h,
    };
    // Manually center the outer panel in the dim backdrop — Yoga
    // handles the panel's internals, not its absolute position.
    this.panel.position.set(
      Math.floor((this.app.screen.width - w) / 2),
      Math.floor((this.app.screen.height - h) / 2),
    );
  }

  private rebuildContent(): void {
    // Tear down any previous panel content (no diffing — the open()
    // path snapshots state once per show).
    if (this.panel) {
      this.container.removeChild(this.panel);
      this.panel.destroy({ children: true });
      this.panel = null;
    }

    const playerId = this.getPlayerId();
    if (playerId === null) {
      this.panel = new LayoutContainer({
        layout: {
          width: 320,
          height: 100,
          padding: PAD * 2,
          backgroundColor: COLOR_BG,
          borderColor: COLOR_BORDER,
          borderWidth: 2,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
      });
      this.panel.addChild(new Text({ text: t('status.noPlayer'), style: labelStyle }));
      this.container.addChild(this.panel);
      this.applyPanelSize();
      return;
    }

    // Outer panel — a LayoutContainer so its backgroundColor / border
    // / padding are rendered by the layout pipeline (no extra
    // Graphics needed). Children stack in a column: title strip on
    // top, then the responsive sub-panel grid.
    this.panel = new LayoutContainer({
      layout: {
        backgroundColor: COLOR_BG,
        borderColor: COLOR_BORDER,
        borderWidth: 2,
        borderRadius: 8,
        padding: PAD,
        gap: GAP,
        flexDirection: 'column',
      },
    });
    this.container.addChild(this.panel);

    // --- Title strip (close button) -------------------------------------
    const titleStrip = new Container({
      layout: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        height: 28,
      },
    });
    this.panel.addChild(titleStrip);
    titleStrip.addChild(this.buildCloseButton());

    // --- Sub-panel grid -------------------------------------------------
    // flex-wrap + minWidth makes the 2-column layout collapse to a
    // single column on narrow viewports (mobile portrait). No more
    // computeLayout() / 2×2 vs 1-col branching in code.
    const grid = new Container({
      layout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        width: '100%',
        flex: 1,
      },
    });
    this.panel.addChild(grid);

    grid.addChild(this.buildIdentityPanel(playerId));
    grid.addChild(this.buildEquipmentPanel(playerId));
    grid.addChild(this.buildStatsTable(playerId));
    grid.addChild(this.buildMagicPanel(playerId));

    this.applyPanelSize();
  }

  // --- Sub-panel factories ----------------------------------------------

  private subPanel(extraLayout: Record<string, unknown> = {}): LayoutContainer {
    return new LayoutContainer({
      layout: {
        flexBasis: '48%',
        minWidth: SUBPANEL_MIN_WIDTH,
        flexGrow: 1,
        flexDirection: 'column',
        padding: PAD,
        gap: 4,
        backgroundColor: COLOR_SUBPANEL_BG,
        borderColor: COLOR_BORDER,
        borderWidth: 1,
        borderRadius: 6,
        ...extraLayout,
      },
    });
  }

  /** Build a label/value row. Label is left-aligned, value is right- */
  private buildRow(label: string, value: string, opts: { muted?: boolean } = {}): Container {
    const row = new Container({
      layout: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    });
    row.addChild(new Text({ text: label, style: labelStyle }));
    row.addChild(
      new Text({
        text: value,
        style: opts.muted ? mutedStyle : valueStyle,
      }),
    );
    return row;
  }

  private buildIdentityPanel(playerId: Entity): LayoutContainer {
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    const hp = this.world.getComponent(playerId, 'Health');
    const sp = this.world.getComponent(playerId, 'SpGauge');
    const panel = this.subPanel();
    if (!character || !prog || !hp || !sp) return panel;

    const name = t(character.avatar.displayNameKey);
    const lv = prog.level;
    // D'LV placeholder — VISION §6.2 DLV system not shipped yet.
    const dlv = 1;
    // MP placeholder — VISION §6.4 MpGauge not shipped yet.
    const mpCur = 0;
    const mpMax = 0;

    panel.addChild(new Text({ text: `${name}    LV ${lv}`, style: titleStyle }));
    panel.addChild(this.buildRow("D'LV", `${dlv}    SP ${Math.floor(sp.current)}`));
    panel.addChild(this.buildRow('HP', `${Math.floor(hp.current)} / ${hp.max}`));
    panel.addChild(this.buildRow('MP', `${mpCur} / ${mpMax}`));
    panel.addChild(this.buildRow('EXP', `${prog.xp} / ${prog.xpToNext}`));
    return panel;
  }

  private buildEquipmentPanel(playerId: Entity): LayoutContainer {
    const character = this.world.getComponent(playerId, 'Character');
    const panel = this.subPanel();
    if (!character) return panel;

    const slots: ReadonlyArray<EquipmentSlot> = ['weapon', 'helmet', 'armor', 'boots', 'ring'];
    const equipped: Partial<Record<EquipmentSlot, string>> = {};
    for (const slug of character.avatar.startingEquipment ?? []) {
      const def = EQUIPMENT[slug];
      equipped[def.slot] = def.name;
    }

    panel.addChild(new Text({ text: t('status.equipment'), style: headerStyle }));
    for (const slot of slots) {
      const name = equipped[slot];
      panel.addChild(
        new Text({
          text: name ?? '—',
          style: name ? valueStyle : mutedStyle,
        }),
      );
    }
    return panel;
  }

  private buildStatsTable(playerId: Entity): LayoutContainer {
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    const panel = this.subPanel();
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

    // Header row (Body / Weapon / Total / Dragoon column labels).
    panel.addChild(this.buildStatHeaderRow());

    // 9 data rows.
    for (const r of STAT_ROWS) {
      panel.addChild(
        this.buildStatRow(
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

  private buildStatHeaderRow(): Container {
    const row = new Container({
      layout: { flexDirection: 'row', width: '100%', gap: 4 },
    });
    // Label column placeholder.
    row.addChild(new Container({ layout: { flexBasis: '28%' } }));
    for (const col of ['body', 'weapon', 'total', 'dragoon'] as const) {
      const cell = new Container({
        layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
      });
      cell.addChild(new Text({ text: t(`status.col.${col}`), style: cellLabelStyle }));
      row.addChild(cell);
    }
    return row;
  }

  private buildStatRow(
    label: string,
    bodyVal: number,
    weaponVal: number,
    dragoonMult: number | null,
    pct: boolean,
    affectedByDragoon: boolean,
  ): Container {
    const row = new Container({
      layout: { flexDirection: 'row', width: '100%', gap: 4 },
    });
    const total = bodyVal + weaponVal;
    const suffix = pct ? '%' : '';

    // Label column.
    const labelCell = new Container({
      layout: { flexBasis: '28%', justifyContent: 'flex-start' },
    });
    labelCell.addChild(new Text({ text: label, style: cellLabelStyle }));
    row.addChild(labelCell);

    // Body column. Empty for pct-style stats (TLoD canon).
    const bodyCell = new Container({
      layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
    });
    if (!pct) {
      bodyCell.addChild(new Text({ text: String(bodyVal), style: cellValueStyle }));
    }
    row.addChild(bodyCell);

    // Weapon column.
    const weaponCell = new Container({
      layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
    });
    weaponCell.addChild(
      new Text({
        text: weaponVal === 0 && pct ? '0%' : `${weaponVal}${suffix}`,
        style: cellValueStyle,
      }),
    );
    row.addChild(weaponCell);

    // Total column.
    const totalCell = new Container({
      layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
    });
    totalCell.addChild(new Text({ text: `${total}${suffix}`, style: cellValueStyle }));
    row.addChild(totalCell);

    // Dragoon column.
    const dragoonCell = new Container({
      layout: { flexBasis: '18%', flexGrow: 1, alignItems: 'flex-end' },
    });
    if (affectedByDragoon && dragoonMult !== null) {
      dragoonCell.addChild(
        new Text({ text: `${Math.round(dragoonMult * 100)}%`, style: cellValueStyle }),
      );
    } else {
      dragoonCell.addChild(new Text({ text: '—', style: cellMutedStyle }));
    }
    row.addChild(dragoonCell);

    return row;
  }

  private buildMagicPanel(playerId: Entity): LayoutContainer {
    const character = this.world.getComponent(playerId, 'Character');
    const panel = this.subPanel();
    if (!character) return panel;

    const archetype = character.avatar.archetype;
    const spells = Array.from(archetype.dragoon.additionUnlocksByLevel.entries()).sort(
      ([a], [b]) => a - b,
    );

    const headerRow = new Container({
      layout: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    });
    headerRow.addChild(new Text({ text: t('status.magic'), style: headerStyle }));
    headerRow.addChild(new Text({ text: t('status.mp'), style: headerStyle }));
    panel.addChild(headerRow);

    if (spells.length === 0) {
      panel.addChild(
        new Text({
          text: t('status.magic.none'),
          style: { fill: COLOR_MUTED, fontSize: 12, fontStyle: 'italic' },
        }),
      );
      return panel;
    }

    // Up to 4 spells — matches the TLoD display.
    spells.slice(0, 4).forEach(([dlv, slug], i) => {
      void dlv;
      const row = new Container({
        layout: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
      });
      const left = new Container({ layout: { flexDirection: 'row', gap: 6 } });
      left.addChild(new Text({ text: `${i + 1}`, style: cellLabelStyle }));
      left.addChild(new Text({ text: prettifySlug(slug), style: cellValueStyle }));
      row.addChild(left);
      // MP cost placeholder — pending spell registry.
      row.addChild(new Text({ text: '—', style: cellMutedStyle }));
      panel.addChild(row);
    });
    return panel;
  }

  private buildCloseButton(): Container {
    const close = new Container({ label: 'status-close' });
    const bg = new Graphics()
      .roundRect(0, 0, 28, 28, 4)
      .fill({ color: 0x2a2f3b, alpha: 0.95 })
      .stroke({ width: 1, color: COLOR_BORDER, alpha: 0.9 });
    const x = new Text({
      text: '×',
      style: { fill: COLOR_VALUE, fontSize: 22, fontWeight: 'bold' },
    });
    x.position.set(9, 0);
    close.addChild(bg, x);
    close.eventMode = 'static';
    close.cursor = 'pointer';
    close.on('pointertap', () => this.close());
    // Mark close button as a leaf so its 28×28 size is respected by
    // its parent's flex layout instead of trying to lay out its
    // (non-layout) Graphics children.
    close.layout = { width: 28, height: 28, isLeaf: true };
    return close;
  }
}

/** Turn 'wingBlaster' / 'gatesOfHeaven' into 'Wing Blaster' / 'Gates Of
 *  Heaven' until an i18n table for spell slugs ships. */
function prettifySlug(slug: string): string {
  return slug
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
