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
  /** Loaded texture from `AssetManager`. Rendered at its NATIVE pixel
   *  size — no stretch — and centered on the iso grid's geometric
   *  center so the painted area aligns naturally with the playable
   *  diamond. The caller is responsible for picking a `width` /
   *  `height` grid that produces iso bounds small enough to fit
   *  INSIDE the texture (so the painted "dead zone" overflows the
   *  iso diamond, never the other way around). When the texture is
   *  bigger than the bounds, the surplus reads as the diamond's
   *  natural shadow border; when it's smaller, the player walks
   *  into unpainted iso tiles, which looks broken. */
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
    // Render at the texture's native pixel size (don't touch width /
    // height), centered on the iso bounds rectangle. Centre-on-bounds
    // keeps the painted scene aligned with the playable diamond when
    // the scene is sized so the iso bounds fit inside the texture
    // (see the texture doc on `PrerenderedMapOptions`).
    sprite.anchor.set(0.5, 0.5);
    sprite.position.set(bounds.minX + bounds.width / 2, bounds.minY + bounds.height / 2);
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
