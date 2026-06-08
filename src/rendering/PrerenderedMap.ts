import type { Texture } from 'pixi.js';
import { Container, Sprite as PixiSprite } from 'pixi.js';
import { TILE_HALF_H, TILE_HALF_W, gridToWorld } from '@core/math/iso';

export interface PrerenderedMapOptions {
  /** Same grid dimensions as the regular `TileMap` — drives the
   *  iso bounds the texture is fitted to. The collision / pathfinder
   *  / entity-spawn JSON is unchanged: this just swaps the floor
   *  visual from a per-tile composited render to a single painted
   *  backdrop. */
  width: number;
  height: number;
  /** Loaded texture from `AssetManager`. Stretched to cover the iso
   *  worldBounds() rectangle. Best results come from authoring at a
   *  2:1 aspect ratio (iso projection is twice as wide as tall) so
   *  the stretch is uniform — see the worldBounds calc below for
   *  the exact pixel target at the current `TILE_HALF_*` constants. */
  texture: Texture;
}

/**
 * Alternative to `TileMap` for scenes that want to use a single
 * AI-painted / hand-painted iso backdrop instead of grid-composited
 * tiles. Same public surface (`container`, `width`, `height`,
 * `worldBounds()`) so `GameplayController` can branch on the scene
 * override without touching anything downstream.
 *
 * Trade-offs vs `TileMap`:
 *  - Painted scenes look much richer than tiled grass / dirt at the
 *    same effort budget (AI gen is far better at coherent scenes
 *    than at seamless tiles).
 *  - No per-tile z-sort against player / mob entities — anything
 *    visually "tall" in the painted scene (trees, walls) gets
 *    walked over by the player. Mitigation in a follow-up: split
 *    the asset into a ground layer (below entities) and an overlay
 *    layer (above entities under a gy threshold). For now, prefer
 *    scenes that read mostly flat.
 *  - Collision / pathfinding still drive off `map.json` — the image
 *    is purely visual.
 *
 * To switch back to the tiled renderer, drop the
 * `prerenderedMapAsset` override on the scene: `GameplayController`
 * builds a `TileMap` again with the same `map.json`. No data is
 * lost either way.
 */
export class PrerenderedMap {
  readonly container: Container;
  readonly width: number;
  readonly height: number;

  constructor(opts: PrerenderedMapOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.container = new Container({ label: 'prerendered-map' });

    const bounds = this.worldBounds();
    const sprite = new PixiSprite(opts.texture);
    // Anchor at top-left so `position + size` maps cleanly to the
    // iso bounding rectangle, then scale to the bounds. Pixi's
    // default behaviour without explicit width/height would render
    // at the texture's native pixel size — almost never what we
    // want for a stretched backdrop.
    sprite.anchor.set(0, 0);
    sprite.position.set(bounds.minX, bounds.minY);
    sprite.width = bounds.width;
    sprite.height = bounds.height;
    this.container.addChild(sprite);
  }

  /** Identical formula to `TileMap.worldBounds()` so the camera /
   *  clamp logic in `GameplayController` is renderer-agnostic. */
  worldBounds(): { width: number; height: number; minX: number; minY: number } {
    const left = gridToWorld(0, this.height - 1).x;
    const right = gridToWorld(this.width - 1, 0).x;
    const top = gridToWorld(0, 0).y;
    const bottom = gridToWorld(this.width - 1, this.height - 1).y;
    return {
      minX: left - TILE_HALF_W,
      minY: top - TILE_HALF_H,
      width: right - left + 2 * TILE_HALF_W,
      height: bottom - top + 2 * TILE_HALF_H,
    };
  }
}
