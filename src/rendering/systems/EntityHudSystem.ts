import type { Container } from 'pixi.js';
import { Graphics, Text } from 'pixi.js';
import type { Entity, System, World } from '@core/ecs';
import { TILE_HALF_H } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { MOB_ABILITIES, type MobAbilityId } from '@data/mobAbilities';
import { t } from '@services/I18nService';

const HP_BAR_WIDTH = 44;
const HP_BAR_HEIGHT = 5;
/** Vertical gap between the entity's reference point (tile bottom) and the HP bar. */
const HP_BAR_OFFSET_ABOVE_HEAD = 96;
const TARGET_RING_RADIUS_X = 36;
const TARGET_RING_RADIUS_Y = 16;
const TARGET_RING_COLOR = 0xffd166;
/** Defend timer bar — drawn UNDER the player while `Defending` is active.
 *  Same mauve as the heal float so the player reads it as "you're tanking
 *  for HP". Depletes from full → empty over the lock-in duration. */
const DEFEND_BAR_WIDTH = 44;
const DEFEND_BAR_HEIGHT = 5;
/** Offset from the player position center down to the bar. The iso tile
 *  is rendered roughly centred on the position, so this puts the bar
 *  just below the player's feet. */
const DEFEND_BAR_OFFSET_BELOW = 28;
const DEFEND_BAR_COLOR = 0x9bb6ff;
/** Same bar, but tinted slate-grey while the defend is on cooldown — a
 *  flat "not ready yet" cue. Fills back as the cooldown drains, so the
 *  player can read when the next defend will land. Mobile UI already
 *  shows this on its dedicated button radial; this gives desktop (and
 *  redundantly mobile) the same feedback in-world. */
const DEFEND_COOLDOWN_BAR_COLOR = 0x4a5566;
/** Cast bar painted above bosses while an AbilityTelegraph is active.
 *  Width matches the HP bar so the two stacks read as one block; sits
 *  just above the HP bar with a small gap. Mobile-conscious: kept thin
 *  and short, the label above carries the readability. */
const CAST_BAR_WIDTH = 56;
const CAST_BAR_HEIGHT = 4;
const CAST_BAR_OFFSET_ABOVE_HP = 18;
const CAST_LABEL_FONT_SIZE = 10;

/**
 * In-world entity overlays (FX layer):
 *  - HP bar above any non-player entity that's been damaged (current < max),
 *    auto-hidden once it heals back to full or enters Dying.
 *  - Target ring at the feet of the entity currently held in the player's
 *    `CombatIntent` — yellow iso-diamond as a "you're aiming at this one" cue.
 *
 * Reuses Pixi nodes per entity (HP bar) and a single shared Graphics for the
 * target ring. Cleans up nodes when the entity disappears or the player drops
 * intent.
 */
interface CastBarNode {
  bar: Graphics;
  label: Text;
  /** Cached state used to avoid recreating the Text on every frame for
   *  the same ability — Text construction triggers a font measure. */
  abilityId: MobAbilityId | null;
}

export class EntityHudSystem implements System<Components> {
  /** Per-entity HP bar node + the last HP fraction its geometry was
   *  drawn for, so we can skip the geometry rebuild when HP is unchanged. */
  private readonly hpBars = new Map<Entity, { node: Graphics; frac: number }>();
  private readonly castBars = new Map<Entity, CastBarNode>();
  private readonly targetRing: Graphics;
  /** Single shared bar — only the player ever has the `Defending`
   *  component, so we don't bother with a per-entity map. */
  private readonly defendBar: Graphics;

  /** Optional read of the player's defend cooldown remaining-fraction
   *  (1 = just triggered, 0 = ready, null = not on cooldown). When
   *  supplied, the defendBar stays visible AFTER the guard window ends,
   *  tinted slate, draining as the cooldown elapses — gives desktop the
   *  same "next defend ready" feedback the mobile button radial gives. */
  private readonly defendCooldownFracProvider: (() => number | null) | null;

  constructor(
    private readonly parent: Container,
    opts: { defendCooldownFrac?: () => number | null } = {},
  ) {
    this.defendCooldownFracProvider = opts.defendCooldownFrac ?? null;
    this.targetRing = new Graphics();
    this.targetRing.visible = false;
    this.parent.addChild(this.targetRing);
    this.defendBar = new Graphics();
    this.defendBar.visible = false;
    this.parent.addChild(this.defendBar);
  }

  update(_dt: number, world: World<Components>): void {
    // --- HP bars ---------------------------------------------------------
    // The bar graphic is positioned at the entity each frame (a cheap
    // transform) but its geometry — the black backing + the coloured fill
    // whose width tracks the HP fraction — is only rebuilt when that
    // fraction actually changes. HP is static between hits, so this skips
    // a Graphics geometry rebuild for every damaged mob on most frames.
    const matched = new Set<Entity>();
    for (const id of world.query(['Health', 'Position'])) {
      if (world.hasComponent(id, 'Player')) continue;
      if (world.hasComponent(id, 'Dying')) continue;
      // Fog of war: don't paint HP bars for out-of-vision mobs — that would
      // leak combat info from beyond the player's sight.
      if (world.hasComponent(id, 'Hidden')) continue;
      const hp = world.getComponent(id, 'Health');
      const pos = world.getComponent(id, 'Position');
      if (!hp || !pos) continue;
      if (hp.current >= hp.max || hp.current <= 0) continue;

      matched.add(id);
      let entry = this.hpBars.get(id);
      if (!entry) {
        const node = new Graphics();
        this.parent.addChild(node);
        entry = { node, frac: -1 };
        this.hpBars.set(id, entry);
      }

      entry.node.position.set(pos.x, pos.y);
      const frac = Math.max(0, Math.min(1, hp.current / hp.max));
      if (Math.abs(frac - entry.frac) > 0.001) {
        entry.frac = frac;
        // Geometry drawn in the node's local space (origin = entity
        // position); the per-frame node.position handles world placement.
        const lx = -HP_BAR_WIDTH / 2;
        const ly = -HP_BAR_OFFSET_ABOVE_HEAD;
        entry.node
          .clear()
          .rect(lx - 1, ly - 1, HP_BAR_WIDTH + 2, HP_BAR_HEIGHT + 2)
          .fill({ color: 0x000000, alpha: 0.7 })
          .rect(lx, ly, HP_BAR_WIDTH * frac, HP_BAR_HEIGHT)
          .fill(hpColor(frac));
      }
    }

    for (const [id, entry] of this.hpBars) {
      if (!matched.has(id)) {
        entry.node.destroy();
        this.hpBars.delete(id);
      }
    }

    // --- Cast bars (boss telegraphs) -------------------------------------
    // Painted above the HP bar for any mob carrying an AbilityTelegraph
    // whose config sets `showCastBar: true` (boss-only by data). Same
    // fog-of-war + dying guards as the HP bar — never leak info on
    // hidden mobs.
    const castMatched = new Set<Entity>();
    for (const id of world.query(['AbilityTelegraph', 'Position'])) {
      if (world.hasComponent(id, 'Player')) continue;
      if (world.hasComponent(id, 'Dying')) continue;
      if (world.hasComponent(id, 'Hidden')) continue;
      const tg = world.getComponent(id, 'AbilityTelegraph');
      const pos = world.getComponent(id, 'Position');
      if (!tg || !pos) continue;
      const config = MOB_ABILITIES[tg.id as MobAbilityId] ?? null;
      if (!config || !config.showCastBar) continue;

      castMatched.add(id);
      let node = this.castBars.get(id);
      if (!node) {
        const bar = new Graphics();
        const label = new Text({
          text: t(config.labelKey),
          style: {
            fontFamily: 'system-ui, sans-serif',
            fontSize: CAST_LABEL_FONT_SIZE,
            fill: config.color,
            fontWeight: 'bold',
            letterSpacing: 1,
            stroke: { color: 0x000000, width: 2 },
          },
        });
        label.anchor.set(0.5, 1);
        this.parent.addChild(bar);
        this.parent.addChild(label);
        node = { bar, label, abilityId: tg.id as MobAbilityId };
        this.castBars.set(id, node);
      } else if (node.abilityId !== tg.id) {
        // Telegraph swapped slug mid-life (rare — a cast that's
        // interrupted and replaced by another). Update the label text +
        // colour without recreating the Pixi nodes.
        node.label.text = t(config.labelKey);
        node.label.style.fill = config.color;
        node.abilityId = tg.id as MobAbilityId;
      }

      const frac = Math.max(0, Math.min(1, tg.elapsedMs / Math.max(1, tg.totalMs)));
      const x = pos.x - CAST_BAR_WIDTH / 2;
      const y = pos.y - HP_BAR_OFFSET_ABOVE_HEAD - CAST_BAR_OFFSET_ABOVE_HP;
      node.bar.clear();
      node.bar
        .rect(x - 1, y - 1, CAST_BAR_WIDTH + 2, CAST_BAR_HEIGHT + 2)
        .fill({ color: 0x000000, alpha: 0.75 })
        .rect(x, y, CAST_BAR_WIDTH * frac, CAST_BAR_HEIGHT)
        .fill(config.color);
      // Label sits just above the bar, anchored bottom-centre.
      node.label.position.set(pos.x, y - 2);
    }

    for (const [id, node] of this.castBars) {
      if (!castMatched.has(id)) {
        node.bar.destroy();
        node.label.destroy();
        this.castBars.delete(id);
      }
    }

    // --- Target ring -----------------------------------------------------
    const players = world.query(['Player']);
    const playerId = players[0];
    let ringPos: { x: number; y: number } | null = null;
    if (playerId !== undefined) {
      const intent = world.getComponent(playerId, 'CombatIntent');
      if (intent !== undefined) {
        const tHp = world.getComponent(intent.targetId, 'Health');
        const tPos = world.getComponent(intent.targetId, 'Position');
        if (
          tHp &&
          tPos &&
          tHp.current > 0 &&
          !world.hasComponent(intent.targetId, 'Dying') &&
          !world.hasComponent(intent.targetId, 'Hidden')
        ) {
          ringPos = { x: tPos.x, y: tPos.y };
        }
      }
    }

    if (ringPos) {
      this.targetRing.clear();
      this.targetRing
        .ellipse(0, 0, TARGET_RING_RADIUS_X, TARGET_RING_RADIUS_Y)
        .stroke({ color: TARGET_RING_COLOR, width: 2, alpha: 0.9 });
      this.targetRing.position.set(ringPos.x, ringPos.y + TILE_HALF_H);
      this.targetRing.visible = true;
    } else {
      this.targetRing.visible = false;
    }

    // --- Defend timer + cooldown bar -------------------------------------
    // Two visual modes for the same bar:
    //   - guard active  → blue, depletes from full as the lock-in runs
    //   - guard pending → slate, FILLS back from empty as the cooldown
    //                     drains, so the player reads when defend will
    //                     be ready again. Pre-empted by the active mode
    //                     so the guard window's countdown always wins.
    let defendVisible = false;
    if (playerId !== undefined) {
      const def = world.getComponent(playerId, 'Defending');
      const pos = world.getComponent(playerId, 'Position');
      if (def && pos && def.totalMs > 0) {
        const remaining = Math.max(0, 1 - def.elapsedMs / def.totalMs);
        this.paintDefendBar(pos.x, pos.y, remaining, DEFEND_BAR_COLOR);
        defendVisible = true;
      } else if (pos && this.defendCooldownFracProvider) {
        const cdFrac = this.defendCooldownFracProvider();
        if (cdFrac !== null && cdFrac > 0) {
          // Bar fills back (left to right) as the cooldown drains, so
          // "full bar" reads as "defend ready" — same direction as the
          // guard countdown, opposite colour.
          const filled = Math.max(0, Math.min(1, 1 - cdFrac));
          this.paintDefendBar(pos.x, pos.y, filled, DEFEND_COOLDOWN_BAR_COLOR);
          defendVisible = true;
        }
      }
    }
    if (!defendVisible) this.defendBar.visible = false;
  }

  /** Paint the shared defend bar at the player's screen position with a
   *  given fill fraction and colour. Used by both the active-guard and
   *  the cooldown branches. */
  private paintDefendBar(px: number, py: number, fillFrac: number, color: number): void {
    const x = px - DEFEND_BAR_WIDTH / 2;
    const y = py + DEFEND_BAR_OFFSET_BELOW;
    this.defendBar
      .clear()
      .rect(x - 1, y - 1, DEFEND_BAR_WIDTH + 2, DEFEND_BAR_HEIGHT + 2)
      .fill({ color: 0x000000, alpha: 0.7 })
      .rect(x, y, DEFEND_BAR_WIDTH * fillFrac, DEFEND_BAR_HEIGHT)
      .fill(color);
    this.defendBar.visible = true;
  }

  destroy(): void {
    for (const { node } of this.hpBars.values()) node.destroy();
    this.hpBars.clear();
    for (const node of this.castBars.values()) {
      node.bar.destroy();
      node.label.destroy();
    }
    this.castBars.clear();
    this.targetRing.destroy();
    this.defendBar.destroy();
  }
}

/** Green → yellow → red interpolation by HP fraction. */
function hpColor(frac: number): number {
  if (frac > 0.6) return 0x4caf50;
  if (frac > 0.3) return 0xffb74d;
  return 0xe53935;
}
