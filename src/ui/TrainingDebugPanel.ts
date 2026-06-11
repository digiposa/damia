/**
 * Training mode debug overlay — the dev-friendly cockpit for the
 * sandbox scene. Lets the tester swap character, slide the player
 * level, spawn mobs, heal up, and clear the field without ever
 * touching the underlying gameplay loop.
 *
 * Mounting / toggle:
 *  - On desktop, the `~` (backtick) key toggles the modal (wired in
 *    TrainingScene since key bindings live at the scene level).
 *  - On every device, a small "DBG" button at the top-left edge of
 *    the screen toggles it too. Always visible while the scene is
 *    active.
 *
 * The panel itself is a Modal subclass — same flexbox stack as the
 * Codex / Settings — so the UX is consistent across menus. Per
 * canon, dev tools live behind a deliberate gesture, not under a
 * stray tap.
 */
import type { Application, Container as PixiContainer } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import type { LayoutContainer } from '@pixi/layout/components';

import { MOBS, type MobKind } from '@data/balance';
import { AVATARS, type CharacterAvatar } from '@data/characters';
import { t } from '@services/I18nService';

import { Modal } from './Modal';
import { COLORS, SPACING, TEXT } from './theme';
import { mkButton, mkCloseButton, mkPanel, mkRow, mkSubPanel, mkText } from './layoutHelpers';

const PANEL_MAX_HEIGHT = 640;
const LEVEL_MIN = 1;
const LEVEL_MAX = 60;
const DBG_BUTTON_SIZE = 32;
const DBG_BUTTON_MARGIN = 16;

export interface TrainingDebugPanelOptions {
  getCurrentAvatar: () => CharacterAvatar;
  getPlayerLevel: () => number;
  setCharacter: (avatar: CharacterAvatar) => void;
  setLevel: (level: number) => void;
  spawnMob: (kind: MobKind, count: number) => void;
  healPlayer: () => void;
  killAllMobs: () => void;
  onQuit: () => void;
}

export class TrainingDebugPanel extends Modal {
  protected override panelMaxHeight = PANEL_MAX_HEIGHT;
  private readonly opts: TrainingDebugPanelOptions;
  /** Floating "DBG" toggle pinned to the top-left corner. Stays on
   *  the same UI layer as the modal but outside the modal's container
   *  so it's visible whether the modal is open or closed. */
  private dbgButton: Container | null = null;
  /** Currently selected mob in the spawner dropdown. */
  private selectedMobKind: MobKind = 'knightOfSandoraSeles';
  private mobKindLabel: Text | null = null;
  private levelLabel: Text | null = null;
  private characterLabel: Text | null = null;

  constructor(app: Application, opts: TrainingDebugPanelOptions) {
    super(app, 'training-debug-panel');
    this.opts = opts;
    this.dbgButton = this.makeDbgButton();
    // Re-position the DBG toggle on resize so it stays glued to the
    // top-left corner across orientation changes.
    const onResize = (): void => {
      if (this.dbgButton) {
        this.dbgButton.position.set(
          DBG_BUTTON_MARGIN + DBG_BUTTON_SIZE / 2,
          DBG_BUTTON_MARGIN + DBG_BUTTON_SIZE / 2,
        );
      }
    };
    app.renderer.on('resize', onResize);
    this.registerCleanup(() => app.renderer.off('resize', onResize));
  }

  protected override onOpen(): void {
    this.refreshLabels();
  }

  /** Mount the DBG toggle button alongside the modal. The scene calls
   *  this once after addChild'ing `.container` to its UI layer, so the
   *  button surfaces from the first frame. The button is a sibling of
   *  `container` (not a child) so it's visible whether the modal is
   *  open or closed. */
  mountToggleButton(parent: PixiContainer): void {
    if (this.dbgButton && !this.dbgButton.parent) {
      parent.addChild(this.dbgButton);
    }
  }

  protected buildPanel(): LayoutContainer {
    const panel = mkPanel({
      layout: { flex: 1, gap: SPACING.gap, alignItems: 'stretch' },
    });

    // --- Header ---
    const titleStrip = mkRow({
      layout: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 32,
      },
    });
    titleStrip.addChild(new Container({ layout: { width: 28, height: 28, isLeaf: true } }));
    titleStrip.addChild(mkText(t('training.title'), TEXT.title));
    titleStrip.addChild(mkCloseButton(() => this.close()));
    panel.addChild(titleStrip);

    // --- Character switcher ---
    panel.addChild(this.buildCharacterSection());
    // --- Level setter ---
    panel.addChild(this.buildLevelSection());
    // --- Mob spawner ---
    panel.addChild(this.buildMobSection());
    // --- Quick actions ---
    panel.addChild(this.buildActionsSection());

    return panel;
  }

  private buildCharacterSection(): LayoutContainer {
    const section = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });
    section.addChild(mkText(t('training.character'), TEXT.cellLabel));

    const valueRow = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    this.characterLabel = mkText('', TEXT.value);
    valueRow.addChild(this.characterLabel);
    valueRow.addChild(
      mkRow({
        layout: { gap: SPACING.gapSmall, alignItems: 'center' },
        children: [
          mkButton({
            label: '<',
            width: 36,
            height: 32,
            fontSize: 16,
            onTap: () => this.cycleCharacter(-1),
          }),
          mkButton({
            label: '>',
            width: 36,
            height: 32,
            fontSize: 16,
            onTap: () => this.cycleCharacter(1),
          }),
        ],
      }),
    );
    section.addChild(valueRow);
    return section;
  }

  private buildLevelSection(): LayoutContainer {
    const section = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });
    section.addChild(mkText(t('training.level'), TEXT.cellLabel));

    const valueRow = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    this.levelLabel = mkText('', TEXT.value);
    valueRow.addChild(this.levelLabel);

    const controls = mkRow({
      layout: { gap: SPACING.gapSmall, alignItems: 'center' },
    });
    controls.addChild(
      mkButton({
        label: '-10',
        width: 44,
        height: 32,
        fontSize: 12,
        onTap: () => this.adjustLevel(-10),
      }),
    );
    controls.addChild(
      mkButton({
        label: '-1',
        width: 36,
        height: 32,
        fontSize: 14,
        onTap: () => this.adjustLevel(-1),
      }),
    );
    controls.addChild(
      mkButton({
        label: '+1',
        width: 36,
        height: 32,
        fontSize: 14,
        onTap: () => this.adjustLevel(+1),
      }),
    );
    controls.addChild(
      mkButton({
        label: '+10',
        width: 44,
        height: 32,
        fontSize: 12,
        onTap: () => this.adjustLevel(+10),
      }),
    );
    valueRow.addChild(controls);
    section.addChild(valueRow);
    return section;
  }

  private buildMobSection(): LayoutContainer {
    const section = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });
    section.addChild(mkText(t('training.spawnMob'), TEXT.cellLabel));

    const pickRow = mkRow({
      layout: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: SPACING.gapSmall,
      },
    });
    this.mobKindLabel = mkText('', TEXT.value);
    pickRow.addChild(this.mobKindLabel);
    pickRow.addChild(
      mkRow({
        layout: { gap: SPACING.gapSmall, alignItems: 'center' },
        children: [
          mkButton({
            label: '<',
            width: 36,
            height: 32,
            fontSize: 16,
            onTap: () => this.cycleMob(-1),
          }),
          mkButton({
            label: '>',
            width: 36,
            height: 32,
            fontSize: 16,
            onTap: () => this.cycleMob(1),
          }),
        ],
      }),
    );
    section.addChild(pickRow);

    const spawnRow = mkRow({
      layout: { width: '100%', gap: SPACING.gapSmall, justifyContent: 'space-between' },
    });
    spawnRow.addChild(
      mkButton({
        label: t('training.spawnOne'),
        width: 140,
        height: 36,
        onTap: () => this.opts.spawnMob(this.selectedMobKind, 1),
      }),
    );
    spawnRow.addChild(
      mkButton({
        label: t('training.spawnFive'),
        width: 140,
        height: 36,
        onTap: () => this.opts.spawnMob(this.selectedMobKind, 5),
      }),
    );
    section.addChild(spawnRow);
    return section;
  }

  private buildActionsSection(): LayoutContainer {
    const section = mkSubPanel({
      layout: { width: '100%', gap: SPACING.gapSmall, padding: SPACING.pad },
    });
    section.addChild(mkText(t('training.actions'), TEXT.cellLabel));

    const row1 = mkRow({
      layout: { width: '100%', gap: SPACING.gapSmall, justifyContent: 'space-between' },
    });
    row1.addChild(
      mkButton({
        label: t('training.healFull'),
        width: 140,
        height: 36,
        onTap: () => this.opts.healPlayer(),
      }),
    );
    row1.addChild(
      mkButton({
        label: t('training.killAll'),
        width: 140,
        height: 36,
        onTap: () => this.opts.killAllMobs(),
      }),
    );
    section.addChild(row1);

    section.addChild(
      mkButton({
        label: t('training.quitToTitle'),
        width: 290,
        height: 36,
        onTap: () => this.opts.onQuit(),
      }),
    );
    return section;
  }

  // ---- Label updates ----

  private refreshLabels(): void {
    if (this.characterLabel) {
      this.characterLabel.text = t(this.opts.getCurrentAvatar().displayNameKey);
    }
    if (this.levelLabel) {
      this.levelLabel.text = `LV ${this.opts.getPlayerLevel()}`;
    }
    if (this.mobKindLabel) {
      this.mobKindLabel.text = t(`codex.entry.${this.selectedMobKind}.name`);
    }
  }

  // ---- Cycling helpers ----

  private cycleCharacter(dir: number): void {
    const list = Object.values(AVATARS).filter((a): a is CharacterAvatar => a !== undefined);
    if (list.length === 0) return;
    const currentId = this.opts.getCurrentAvatar().id;
    const idx = list.findIndex((a) => a.id === currentId);
    const next = list[(idx + dir + list.length) % list.length]!;
    this.opts.setCharacter(next);
    this.refreshLabels();
  }

  private adjustLevel(delta: number): void {
    const next = Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, this.opts.getPlayerLevel() + delta));
    this.opts.setLevel(next);
    this.refreshLabels();
  }

  private cycleMob(dir: number): void {
    const kinds = Object.keys(MOBS) as MobKind[];
    if (kinds.length === 0) return;
    const idx = kinds.indexOf(this.selectedMobKind);
    this.selectedMobKind = kinds[(idx + dir + kinds.length) % kinds.length]!;
    this.refreshLabels();
  }

  // ---- DBG toggle button (corner) ----

  private makeDbgButton(): Container {
    const c = new Container({ label: 'training-dbg-toggle' });
    const bg = new Graphics()
      .roundRect(-DBG_BUTTON_SIZE / 2, -DBG_BUTTON_SIZE / 2, DBG_BUTTON_SIZE, DBG_BUTTON_SIZE, 6)
      .fill({ color: COLORS.buttonBg, alpha: 0.92 })
      .stroke({ color: COLORS.borderActive, width: 1 });
    const label = new Text({
      text: 'DBG',
      style: { fill: COLORS.borderActive, fontSize: 11, fontWeight: 'bold' },
    });
    label.anchor.set(0.5);
    c.addChild(bg, label);
    c.eventMode = 'static';
    c.cursor = 'pointer';
    c.on('pointertap', () => this.toggle());
    c.position.set(
      DBG_BUTTON_MARGIN + DBG_BUTTON_SIZE / 2,
      DBG_BUTTON_MARGIN + DBG_BUTTON_SIZE / 2,
    );
    return c;
  }
}
