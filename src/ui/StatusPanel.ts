import type { Application } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import type { Entity, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { getCharacterStatsAtLevel } from '@data/characters';
import { EQUIPMENT, totalEquipmentBonuses, type EquipmentSlot } from '@data/equipment';
import { t } from '@services/I18nService';

/**
 * Read-only character status overlay — page 1 of the future TLoD-style
 * in-game menu (Inventory / Magic / Equipment / Status / Save / …).
 * Layout faithful to the PS1 status screen: 2 × 2 panel grid
 *   - top-left:    identity + vitals (LV, D'LV, SP, HP, MP, EXP)
 *   - top-right:   equipped items (weapon / helmet / armor / boots / ring)
 *   - bottom-left: Body / Weapon / Total / Dragoon stats table
 *   - bottom-right: Dragoon Magic list with MP costs
 *
 * Snapshot rendered on open(); the world is paused by the controller
 * while the panel is up so no per-frame refresh is needed. Equipment
 * is read live from `Character.avatar.startingEquipment` until the
 * swap-equipment system ships.
 */

const PANEL_WIDTH = 700;
const PANEL_HEIGHT = 500;
const SUB_W = (PANEL_WIDTH - 30) / 2;
const SUB_H = (PANEL_HEIGHT - 30) / 2;
const PAD = 10;
const HEADER_HEIGHT = 22;
const LINE_HEIGHT = 20;

const COLOR_BG = 0x1a1f2b;
const COLOR_BORDER = 0xa08050;
const COLOR_LABEL = 0xccd2dd;
const COLOR_VALUE = 0xffffff;
const COLOR_MUTED = 0x808a9a;

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

export class StatusPanel {
  readonly container: Container;
  private readonly app: Application;
  private readonly world: World<Components>;
  private readonly getPlayerId: () => Entity | null;
  private readonly panel: Container;
  private body: Container | null = null;
  private isOpen_ = false;
  private readonly cleanups: Array<() => void> = [];

  constructor(app: Application, world: World<Components>, getPlayerId: () => Entity | null) {
    this.app = app;
    this.world = world;
    this.getPlayerId = getPlayerId;
    this.container = new Container({ label: 'status-panel' });
    this.container.visible = false;

    const dim = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });
    dim.eventMode = 'static';
    this.container.addChild(dim);

    this.panel = new Container({ label: 'status-panel-box' });
    this.container.addChild(this.panel);

    const onResize = (): void => {
      dim
        .clear()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000, alpha: 0.7 });
      this.reposition();
    };
    app.renderer.on('resize', onResize);
    this.cleanups.push(() => app.renderer.off('resize', onResize));

    this.reposition();
  }

  open(): void {
    this.rebuildContent();
    this.container.visible = true;
    this.isOpen_ = true;
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

  private reposition(): void {
    this.panel.position.set(
      Math.floor((this.app.screen.width - PANEL_WIDTH) / 2),
      Math.floor((this.app.screen.height - PANEL_HEIGHT) / 2),
    );
  }

  /** Rebuild the inner content from the live player state. Called on
   *  every `open()` so a save-restore between opens picks up correctly. */
  private rebuildContent(): void {
    if (this.body) this.panel.removeChild(this.body);
    this.body = new Container();
    this.panel.addChild(this.body);

    // Outer frame.
    const frame = new Graphics()
      .roundRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 8)
      .fill({ color: COLOR_BG, alpha: 0.96 })
      .stroke({ width: 2, color: COLOR_BORDER, alpha: 0.95 });
    this.body.addChild(frame);

    const playerId = this.getPlayerId();
    if (playerId === null) {
      const msg = new Text({
        text: t('status.noPlayer'),
        style: { fill: COLOR_LABEL, fontSize: 16 },
      });
      msg.position.set(PAD * 2, PAD * 2);
      this.body.addChild(msg);
      return;
    }

    // Sub-panel positions in the 2×2 grid.
    const left = PAD;
    const right = PAD + SUB_W + 10;
    const top = PAD;
    const bottom = PAD + SUB_H + 10;

    this.buildIdentityPanel(playerId, left, top);
    this.buildEquipmentPanel(playerId, right, top);
    this.buildStatsTable(playerId, left, bottom);
    this.buildMagicPanel(playerId, right, bottom);

    // Close button (top-right corner, just outside the panel grid).
    const close = new Container({ label: 'status-close' });
    const closeBg = new Graphics()
      .roundRect(0, 0, 24, 24, 4)
      .fill({ color: 0x2a2f3b, alpha: 0.95 })
      .stroke({ width: 1, color: COLOR_BORDER, alpha: 0.9 });
    const closeX = new Text({
      text: '×',
      style: { fill: COLOR_VALUE, fontSize: 18, fontWeight: 'bold' },
    });
    closeX.position.set(8, 1);
    close.addChild(closeBg, closeX);
    close.position.set(PANEL_WIDTH - 28, 6);
    close.eventMode = 'static';
    close.cursor = 'pointer';
    close.on('pointertap', () => this.close());
    this.body.addChild(close);
  }

  // --- Top-left: Identity + Vitals --------------------------------------
  private buildIdentityPanel(playerId: Entity, x: number, y: number): void {
    if (!this.body) return;
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    const hp = this.world.getComponent(playerId, 'Health');
    const sp = this.world.getComponent(playerId, 'SpGauge');
    if (!character || !prog || !hp || !sp) return;

    this.drawSubPanel(x, y);

    const name = t(character.avatar.displayNameKey);
    const lv = prog.level;
    // D'LV is the Dragoon Level (1..5). Not yet tracked on the
    // entity — placeholder 1 until the DLV system ships per VISION §6.2.
    const dlv = 1;
    // SP gauge — MAX scales with DLV in TLoD (100 + 100×(DLV-1) up to 500).
    const spCur = Math.floor(sp.current);
    // MP is not tracked yet (VISION §6.4); placeholder 0/0 until the
    // MpGauge component ships.
    const mpCur = 0;
    const mpMax = 0;

    const labelStyle = { fill: COLOR_LABEL, fontSize: 13 };
    const valueStyle = { fill: COLOR_VALUE, fontSize: 14, fontWeight: 'bold' as const };
    const headerStyle = { fill: COLOR_VALUE, fontSize: 18, fontWeight: 'bold' as const };

    // Name + LV on top line.
    const header = new Text({ text: `${name}    LV ${lv}`, style: headerStyle });
    header.position.set(x + PAD, y + PAD);
    this.body.addChild(header);

    // Numeric rows (D'LV, SP, HP, MP, EXP).
    const rows: Array<[string, string]> = [
      ["D'LV", `${dlv}    SP ${spCur}`],
      ['HP', `${Math.floor(hp.current)} / ${hp.max}`],
      ['MP', `${mpCur} / ${mpMax}`],
      ['EXP', `${prog.xp} / ${prog.xpToNext}`],
    ];
    rows.forEach(([label, value], i) => {
      const yOff = y + PAD + HEADER_HEIGHT + 14 + i * LINE_HEIGHT;
      const lbl = new Text({ text: label, style: labelStyle });
      lbl.position.set(x + PAD, yOff);
      this.body!.addChild(lbl);
      const val = new Text({ text: value, style: valueStyle });
      val.position.set(x + PAD + 60, yOff);
      this.body!.addChild(val);
    });
  }

  // --- Top-right: Equipment ---------------------------------------------
  private buildEquipmentPanel(playerId: Entity, x: number, y: number): void {
    if (!this.body) return;
    const character = this.world.getComponent(playerId, 'Character');
    if (!character) return;

    this.drawSubPanel(x, y);

    const slots: ReadonlyArray<EquipmentSlot> = ['weapon', 'helmet', 'armor', 'boots', 'ring'];
    const equipped: Partial<Record<EquipmentSlot, string>> = {};
    for (const slug of character.avatar.startingEquipment ?? []) {
      const def = EQUIPMENT[slug];
      equipped[def.slot] = def.name;
    }

    const header = new Text({
      text: t('status.equipment'),
      style: { fill: COLOR_VALUE, fontSize: 14, fontWeight: 'bold' },
    });
    header.position.set(x + PAD, y + PAD);
    this.body.addChild(header);

    slots.forEach((slot, i) => {
      const yOff = y + PAD + HEADER_HEIGHT + 6 + i * LINE_HEIGHT;
      const name = equipped[slot];
      const txt = new Text({
        text: name ?? '—',
        style: { fill: name ? COLOR_VALUE : COLOR_MUTED, fontSize: 13 },
      });
      txt.position.set(x + PAD, yOff);
      this.body!.addChild(txt);
    });
  }

  // --- Bottom-left: Body / Weapon / Total / Dragoon stats table ---------
  private buildStatsTable(playerId: Entity, x: number, y: number): void {
    if (!this.body) return;
    const character = this.world.getComponent(playerId, 'Character');
    const prog = this.world.getComponent(playerId, 'Progression');
    if (!character || !prog) return;

    this.drawSubPanel(x, y);

    const archetype = character.avatar.archetype;
    const row = getCharacterStatsAtLevel(archetype, prog.level);
    const baseAction = archetype.actionStats.base;
    const eq = totalEquipmentBonuses(character.avatar.startingEquipment, archetype.id);
    const mult = archetype.dragoon.statsMultiplier;

    // Body = level row + actionStats.base for fields not in the row.
    // Weapon = sum of equipment bonuses on the matching key.
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

    // Column x offsets inside the sub-panel.
    const colLabelX = x + PAD;
    const colBodyX = x + PAD + 80;
    const colWeaponX = x + PAD + 130;
    const colTotalX = x + PAD + 180;
    const colDragoonX = x + PAD + 235;

    const headerY = y + PAD;
    const headerStyle = { fill: COLOR_VALUE, fontSize: 12, fontWeight: 'bold' as const };
    const hBody = new Text({ text: t('status.col.body'), style: headerStyle });
    hBody.position.set(colBodyX, headerY);
    const hWeapon = new Text({ text: t('status.col.weapon'), style: headerStyle });
    hWeapon.position.set(colWeaponX, headerY);
    const hTotal = new Text({ text: t('status.col.total'), style: headerStyle });
    hTotal.position.set(colTotalX, headerY);
    const hDragoon = new Text({ text: t('status.col.dragoon'), style: headerStyle });
    hDragoon.position.set(colDragoonX, headerY);
    this.body.addChild(hBody, hWeapon, hTotal, hDragoon);

    STAT_ROWS.forEach((rowDef, i) => {
      const yOff = y + PAD + HEADER_HEIGHT + i * LINE_HEIGHT;
      const labelStyle = { fill: COLOR_LABEL, fontSize: 12, fontWeight: 'bold' as const };
      const valueStyle = { fill: COLOR_VALUE, fontSize: 12 };
      const mutedStyle = { fill: COLOR_MUTED, fontSize: 12 };

      const label = new Text({ text: t(`status.stat.${rowDef.key}`), style: labelStyle });
      label.position.set(colLabelX, yOff);
      this.body!.addChild(label);

      const bodyVal = body[rowDef.key] ?? 0;
      const weaponVal = weapon[rowDef.key] ?? 0;
      const total = bodyVal + weaponVal;
      const suffix = rowDef.pct ? '%' : '';

      // For hit/avoid stats (pct), TLoD canonically leaves the Body
      // column empty — only Weapon contributes. Match that convention.
      if (!rowDef.pct) {
        const tBody = new Text({ text: String(bodyVal), style: valueStyle });
        tBody.position.set(colBodyX, yOff);
        this.body!.addChild(tBody);
      }
      const tWeapon = new Text({
        text: weaponVal === 0 && rowDef.pct ? '0%' : `${weaponVal}${suffix}`,
        style: valueStyle,
      });
      tWeapon.position.set(colWeaponX, yOff);
      this.body!.addChild(tWeapon);
      const tTotal = new Text({ text: `${total}${suffix}`, style: valueStyle });
      tTotal.position.set(colTotalX, yOff);
      this.body!.addChild(tTotal);

      // Dragoon column: percentage from archetype.dragoon.statsMultiplier
      // for AT/DF/MAT/MDF; blank for SPEED + hit/avoid stats (TLoD
      // canonical).
      if (rowDef.affectedByDragoon && dragoonMult[rowDef.key] !== null) {
        const m = dragoonMult[rowDef.key] as number;
        const tDragoon = new Text({
          text: `${Math.round(m * 100)}%`,
          style: valueStyle,
        });
        tDragoon.position.set(colDragoonX, yOff);
        this.body!.addChild(tDragoon);
      } else {
        const tDragoon = new Text({ text: '—', style: mutedStyle });
        tDragoon.position.set(colDragoonX, yOff);
        this.body!.addChild(tDragoon);
      }
    });
  }

  // --- Bottom-right: Dragoon Magic --------------------------------------
  private buildMagicPanel(playerId: Entity, x: number, y: number): void {
    if (!this.body) return;
    const character = this.world.getComponent(playerId, 'Character');
    if (!character) return;

    this.drawSubPanel(x, y);

    const archetype = character.avatar.archetype;
    const spells = Array.from(archetype.dragoon.additionUnlocksByLevel.entries()).sort(
      ([a], [b]) => a - b,
    );

    const headerStyle = { fill: COLOR_VALUE, fontSize: 13, fontWeight: 'bold' as const };
    const hMagic = new Text({ text: t('status.magic'), style: headerStyle });
    hMagic.position.set(x + PAD, y + PAD);
    const hMp = new Text({ text: t('status.mp'), style: headerStyle });
    hMp.position.set(x + SUB_W - PAD - 24, y + PAD);
    this.body.addChild(hMagic, hMp);

    if (spells.length === 0) {
      const none = new Text({
        text: t('status.magic.none'),
        style: { fill: COLOR_MUTED, fontSize: 12, fontStyle: 'italic' },
      });
      none.position.set(x + PAD, y + PAD + HEADER_HEIGHT + 6);
      this.body.addChild(none);
      return;
    }

    // Show up to 4 spell slots — matches TLoD's display.
    spells.slice(0, 4).forEach(([dlv, slug], i) => {
      const yOff = y + PAD + HEADER_HEIGHT + 6 + i * LINE_HEIGHT;
      const idxStyle = { fill: COLOR_LABEL, fontSize: 12, fontWeight: 'bold' as const };
      const nameStyle = { fill: COLOR_VALUE, fontSize: 12 };
      const mutedStyle = { fill: COLOR_MUTED, fontSize: 12 };

      const idx = new Text({ text: `${i + 1}`, style: idxStyle });
      idx.position.set(x + PAD, yOff);
      const nameTxt = new Text({ text: prettifySlug(slug), style: nameStyle });
      nameTxt.position.set(x + PAD + 22, yOff);
      // MP cost placeholder — actual cost comes from a future
      // dragoon-spell registry, see VISION §6.3.
      void dlv;
      const mp = new Text({ text: '—', style: mutedStyle });
      mp.position.set(x + SUB_W - PAD - 24, yOff);
      this.body!.addChild(idx, nameTxt, mp);
    });
  }

  /** Draw one sub-panel background at (x, y). */
  private drawSubPanel(x: number, y: number): void {
    if (!this.body) return;
    const bg = new Graphics()
      .roundRect(x, y, SUB_W, SUB_H, 6)
      .fill({ color: 0x0e1320, alpha: 0.85 })
      .stroke({ width: 1, color: COLOR_BORDER, alpha: 0.7 });
    this.body.addChild(bg);
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
