import { Container, Graphics, Sprite as PixiSprite } from 'pixi.js';
import type { Entity, System, World } from '@core/ecs';
import { TILE_HALF_H, TILE_HALF_W } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import type { Vfx, VfxKind } from '@gameplay/components/Vfx';
import { AssetManager } from '@services/AssetManager';

type VfxNode = Graphics | PixiSprite | Container;

/** Offsets (in world px) of the 4 Magma pillars relative to the AoE
 *  centre — a tight square pattern lifted from the PS1 TLoD cast. */
const MAGMA_PILLAR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-44, -22],
  [44, -22],
  [-44, 22],
  [44, 22],
];

/**
 * Renders + animates one-shot Vfx entities. Each Vfx has a `kind` that picks
 * the per-frame draw routine; when `elapsedMs >= durationMs` the entity is
 * destroyed and its Pixi node cleaned up. New elemental spells should add a
 * case to the dispatcher below — keep the kind list in sync with `VfxKind`.
 *
 * Two visual flavours coexist:
 *  - procedural (`flameBurst`): a Pixi.Graphics redrawn each frame.
 *  - textured  (`fireImpact`): a Pixi.Sprite tweened (scale / alpha / y-rise)
 *    on a static texture. Adds the visual richness of a hand-drawn asset
 *    without needing a sprite-sheet.
 */
export class VfxSystem implements System<Components> {
  private readonly nodes = new Map<Entity, VfxNode>();

  constructor(private readonly parent: Container) {}

  update(dt: number, world: World<Components>): void {
    const matched = new Set<Entity>(world.query(['Vfx', 'Position']));

    for (const id of matched) {
      const vfx = world.getComponent(id, 'Vfx');
      const pos = world.getComponent(id, 'Position');
      if (!vfx || !pos) continue;

      vfx.elapsedMs += dt;
      const t = Math.min(1, vfx.elapsedMs / vfx.durationMs);

      let node = this.nodes.get(id);
      if (!node) {
        node = createNode(vfx);
        this.parent.addChild(node);
        this.nodes.set(id, node);
      }
      drawVfx(node, vfx, t, pos.x, pos.y);

      if (vfx.elapsedMs >= vfx.durationMs) {
        world.destroyEntity(id);
      }
    }

    for (const [id, node] of this.nodes) {
      if (!matched.has(id)) {
        node.destroy();
        this.nodes.delete(id);
      }
    }
  }

  destroy(): void {
    for (const node of this.nodes.values()) node.destroy();
    this.nodes.clear();
  }
}

/** Build the right Pixi node type for a Vfx kind on first frame. */
function createNode(vfx: Vfx): VfxNode {
  switch (vfx.kind satisfies VfxKind) {
    case 'fireImpact': {
      const tex = AssetManager.getTexture('vfx.fireImpact');
      if (tex) {
        const s = new PixiSprite(tex);
        s.anchor.set(0.5, 1); // base of the flame on the impact point
        return s;
      }
      // Texture missing → fall back to procedural so the spell still has SOME effect.
      return new Graphics();
    }
    case 'magmaPillars': {
      // Composite node: a Container with 4 children, one per pillar.
      // Each child is a fireImpact-style sprite (when the texture is
      // available) or a procedural flame burst fallback. Animated per
      // child in drawVfx.
      const root = new Container({ label: 'vfx-magma-pillars' });
      const tex = AssetManager.getTexture('vfx.fireImpact');
      for (let i = 0; i < MAGMA_PILLAR_OFFSETS.length; i++) {
        if (tex) {
          const s = new PixiSprite(tex);
          s.anchor.set(0.5, 1);
          root.addChild(s);
        } else {
          root.addChild(new Graphics());
        }
      }
      return root;
    }
    case 'flameBurst':
    case 'clickMove':
    case 'clickAttack':
    default:
      return new Graphics();
  }
}

function drawVfx(node: VfxNode, vfx: Vfx, t: number, x: number, y: number): void {
  switch (vfx.kind satisfies VfxKind) {
    case 'flameBurst':
      if (node instanceof Graphics) {
        node.clear();
        drawFlameBurst(node, vfx.radius, t);
      }
      node.position.set(x, y);
      break;
    case 'fireImpact':
      if (node instanceof PixiSprite) animateFireImpactSprite(node, vfx.radius, t, x, y);
      else if (node instanceof Graphics) {
        // Texture-load fallback path.
        node.clear();
        drawFlameBurst(node, vfx.radius, t);
        node.position.set(x, y);
      }
      break;
    case 'clickMove':
      if (node instanceof Graphics) {
        node.clear();
        drawClickMove(node, t);
      }
      node.position.set(x, y);
      break;
    case 'clickAttack':
      if (node instanceof Graphics) {
        node.clear();
        drawClickAttack(node, vfx.radius, t);
      }
      node.position.set(x, y);
      break;
    case 'magmaPillars':
      // Pin the composite container to the AoE centre, then animate each
      // pillar around it. Per-pillar offsets are added inside the
      // animator so the children's anchors line up with their impact
      // points (small purple shockwave at base + tall flame above).
      node.position.set(x, y);
      if (node instanceof Container && !(node instanceof PixiSprite)) {
        animateMagmaPillars(node, vfx.radius, t);
      }
      break;
  }
}

/**
 * Click-on-tile feedback (move command). Iso diamond outline that scales
 * 0.6 → 1.4 of a tile across the lifetime, fading out. Quick (~350 ms).
 */
function drawClickMove(node: Graphics, t: number): void {
  const scale = 0.6 + t * 0.8;
  const w = TILE_HALF_W * scale;
  const h = TILE_HALF_H * scale;
  const alpha = Math.max(0, 1 - t);
  node.poly([0, -h, w, 0, 0, h, -w, 0]).stroke({
    color: 0x9bd8ff,
    width: 2.5,
    alpha,
  });
}

/**
 * Click-on-enemy feedback (attack command). Red ring that expands a bit and
 * fades. Anchored on the enemy's world position, so it pulses with the
 * already-displayed yellow target ring underneath.
 */
function drawClickAttack(node: Graphics, radius: number, t: number): void {
  const r = radius * (1 + t * 0.4);
  const alpha = Math.max(0, 1 - t);
  node.circle(0, 0, r).stroke({ color: 0xff5050, width: 3, alpha });
}

/**
 * Sprite-based fire impact for Burn Out. Static texture animated via:
 *  - scale: ease-out pop from 0.4 → 1.15, then a slight grow to 1.3 by end
 *  - alpha: full → fade to 0 over the second half
 *  - y rise: -20 px lift across the lifetime (flame "lifts" as it dissipates)
 *  - rotation flicker: ±0.05 rad sin wave for liveliness
 *
 * `radius` (world px) is the target final flame height — scale is computed so
 * `texture.height * scale ≈ radius * 2.5` at peak so a 60 px radius reads as a
 * ~150 px tall flame, matching the source asset's aspect.
 */
function animateFireImpactSprite(
  sprite: PixiSprite,
  radius: number,
  t: number,
  x: number,
  y: number,
): void {
  if (!sprite.texture) return;
  // Peak scale targets ~2.5× the radius height (matches source ~145 px tall ÷ 60 px radius).
  const peakHeightPx = radius * 2.5;
  const peakScale = peakHeightPx / sprite.texture.height;

  let scale: number;
  if (t < 0.25) {
    // Ease-out pop: 0.4 → 1.0 of peak.
    const k = t / 0.25;
    scale = peakScale * (0.4 + 0.6 * (1 - (1 - k) * (1 - k)));
  } else {
    // Slow growth: 1.0 → 1.15 of peak across the rest.
    scale = peakScale * (1 + (0.15 * (t - 0.25)) / 0.75);
  }
  sprite.scale.set(scale);

  // Alpha: full until t=0.4, then fade to 0.
  sprite.alpha = t < 0.4 ? 1 : Math.max(0, 1 - (t - 0.4) / 0.6);

  // Y-rise so the flame lifts as it dissipates.
  const rise = -20 * t;

  // Subtle rotation wobble for "flicker".
  sprite.rotation = Math.sin(t * 18) * 0.05;

  sprite.position.set(x, y + rise);
}

/**
 * Gushing Magma — 4 fire pillars rising from a square pattern around the
 * AoE centre. Each child is either a Burn-Out sprite (when the texture
 * is available) animated like `fireImpact`, or a procedural flame burst
 * fallback. Children are staggered so the pillars don't all peak at the
 * same instant, matching the cascading "VROOM VROOM VROOM VROOM" feel of
 * the PS1 cast.
 */
function animateMagmaPillars(node: Container, radius: number, t: number): void {
  const childCount = Math.min(node.children.length, MAGMA_PILLAR_OFFSETS.length);
  // Smaller flame than Burn Out (60% of the cast radius) so 4 of them
  // don't fill the screen — the AoE damage radius is what makes the
  // spell hit, the visuals just have to sell the impact.
  const pillarRadius = Math.max(40, radius * 0.6);
  for (let i = 0; i < childCount; i++) {
    const child = node.children[i];
    const offset = MAGMA_PILLAR_OFFSETS[i];
    if (!child || !offset) continue;
    // Stagger each pillar by ~10% of the lifetime so they pop in
    // sequence rather than all at once.
    const localT = Math.min(1, Math.max(0, (t - i * 0.1) / 0.9));
    const [ox, oy] = offset;
    if (child instanceof PixiSprite) {
      animateFireImpactSprite(child, pillarRadius, localT, ox, oy);
    } else if (child instanceof Graphics) {
      child.clear();
      if (localT > 0) drawFlameBurst(child, pillarRadius, localT);
      child.position.set(ox, oy);
    }
  }
}

/**
 * Flame burst (fire-element spells). Two-stage scale: explosive growth in the
 * first 30 % then a slower expansion + fade. Three concentric layers (yellow
 * core → orange body → red halo) plus a few flicker spikes around the edge.
 */
function drawFlameBurst(node: Graphics, endRadius: number, t: number): void {
  // Eased growth: fast pop, then slow expansion.
  const growth = t < 0.3 ? t / 0.3 : 1 + (t - 0.3) * 0.4;
  const r = endRadius * growth;
  const fade = Math.max(0, 1 - t);
  const fadeSq = fade * fade;

  // Outer red halo.
  node.circle(0, 0, r * 1.05).fill({ color: 0xff3a14, alpha: 0.35 * fadeSq });
  // Orange body.
  node.circle(0, 0, r * 0.75).fill({ color: 0xff7028, alpha: 0.7 * fade });
  // Yellow core.
  node.circle(0, 0, r * 0.4).fill({ color: 0xfff5a0, alpha: fade });

  // Flicker spikes — small dots circling the rim, animated by t for a "writhe".
  const spikes = 6;
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2 + t * 4;
    const rim = r * (0.7 + 0.25 * Math.sin(t * 9 + i));
    const sx = Math.cos(angle) * rim;
    const sy = Math.sin(angle) * rim;
    node.circle(sx, sy, r * 0.18).fill({ color: 0xffaa3a, alpha: 0.6 * fade });
  }
}
