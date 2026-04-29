import type { Texture } from 'pixi.js';
import { Container, Graphics, Matrix } from 'pixi.js';
import { TILE_HALF_H, TILE_HALF_W, gridToWorld } from '@core/math/iso';

export interface TileMapPathZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TileMapOptions {
  width: number;
  height: number;
  /** Two grass tones (alternated by checker pattern) — fallback when no ground texture. */
  grassColors?: readonly [number, number];
  /** Two dirt tones — fallback when no path tiles. */
  dirtColors?: readonly [number, number];
  /** Rectangular zones rendered as path tiles. Cells outside are grass. */
  pathZones?: readonly TileMapPathZone[];
  /** Seamless ground texture used as a tiled background (M8). */
  groundTexture?: Texture | null;
  /** Iso path tile variants — one is picked per path cell using a stable hash (M8). */
  pathTextures?: readonly (Texture | null)[];
}

const DEFAULT_GRASS: readonly [number, number] = [0x3a5a3f, 0x2e4a32];
const DEFAULT_DIRT: readonly [number, number] = [0x6e4a2c, 0x614127];

/**
 * Iso tilemap renderer. Two paths:
 *  - Textures provided (M8) → seamless ground background under iso path tiles
 *    sourced from the Rafael Sewa pack. Multiple path variants are picked per
 *    cell via a stable hash so the path doesn't repeat visibly.
 *  - No textures (M3) → solid colored diamonds in a 2-tone checker pattern.
 */
export class TileMap {
  readonly container: Container;
  readonly width: number;
  readonly height: number;

  constructor(opts: TileMapOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.container = new Container({ label: 'tilemap' });

    const zones = opts.pathZones ?? [];
    const pathTextures = (opts.pathTextures ?? []).filter((t): t is Texture => t !== null);

    if (opts.groundTexture && pathTextures.length > 0) {
      this.drawTextured(opts.groundTexture, pathTextures, zones);
    } else {
      const grass = opts.grassColors ?? DEFAULT_GRASS;
      const dirt = opts.dirtColors ?? DEFAULT_DIRT;
      this.drawColored(grass, dirt, zones);
    }
  }

  private drawColored(
    grass: readonly [number, number],
    dirt: readonly [number, number],
    zones: readonly TileMapPathZone[],
  ): void {
    const g = new Graphics();
    for (let gy = 0; gy < this.height; gy++) {
      for (let gx = 0; gx < this.width; gx++) {
        const center = gridToWorld(gx, gy);
        const palette = this.isInZone(zones, gx, gy) ? dirt : grass;
        const color = palette[(gx + gy) % 2 === 0 ? 0 : 1];
        g.poly([
          center.x,
          center.y - TILE_HALF_H,
          center.x + TILE_HALF_W,
          center.y,
          center.x,
          center.y + TILE_HALF_H,
          center.x - TILE_HALF_W,
          center.y,
        ]);
        g.fill(color);
        g.stroke({ width: 1, color: 0x1a2b1d, alpha: 0.4 });
      }
    }
    this.container.addChild(g);
  }

  private drawTextured(
    groundTex: Texture,
    pathTextures: readonly Texture[],
    zones: readonly TileMapPathZone[],
  ): void {
    // Ground = ONE giant iso diamond covering the playable area, filled with
    // the seamless ground texture. No internal seams (it's a single polygon).
    // The 4 corners come from gridToWorld of the grid corners.
    const corners = {
      n: gridToWorld(0, 0),
      e: gridToWorld(this.width - 1, 0),
      s: gridToWorld(this.width - 1, this.height - 1),
      w: gridToWorld(0, this.height - 1),
    };
    const ground = new Graphics();
    ground.poly([
      corners.n.x,
      corners.n.y - TILE_HALF_H,
      corners.e.x + TILE_HALF_W,
      corners.e.y,
      corners.s.x,
      corners.s.y + TILE_HALF_H,
      corners.w.x - TILE_HALF_W,
      corners.w.y,
    ]);
    // Matrix scales world coords to texture-pixel coords so the texture tiles
    // at its native resolution (REPEAT wrap is set in AssetManager). Without
    // this, Pixi stretches one texture across the whole shape bbox.
    ground.fill({ texture: groundTex, matrix: tilingMatrix(groundTex) });
    this.container.addChild(ground);

    // Path = ONE polygon per zone (rectangular grid zone → iso parallelogram in
    // world space). Drawn on top of ground. Single fill per Graphics, no internal
    // edges, multiple zones in one pass for overlap to merge cleanly.
    if (pathTextures.length === 0) return;
    const variant = pathTextures[0];
    if (!variant) return;
    const path = new Graphics();
    for (const z of zones) {
      const a = gridToWorld(z.x, z.y);
      const b = gridToWorld(z.x + z.w - 1, z.y);
      const c = gridToWorld(z.x + z.w - 1, z.y + z.h - 1);
      const d = gridToWorld(z.x, z.y + z.h - 1);
      path.poly([
        a.x,
        a.y - TILE_HALF_H,
        b.x + TILE_HALF_W,
        b.y,
        c.x,
        c.y + TILE_HALF_H,
        d.x - TILE_HALF_W,
        d.y,
      ]);
    }
    path.fill({ texture: variant, matrix: tilingMatrix(variant) });
    this.container.addChild(path);
  }

  private isInZone(zones: readonly TileMapPathZone[], gx: number, gy: number): boolean {
    for (const z of zones) {
      if (gx >= z.x && gx < z.x + z.w && gy >= z.y && gy < z.y + z.h) return true;
    }
    return false;
  }

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

/**
 * Build a Pixi v8 fill matrix that makes a texture TILE at its native resolution
 * across a Graphics shape (instead of stretching one copy to the bbox). Combined
 * with `texture.source.style.addressMode = 'repeat'` set in AssetManager, the
 * texture seamlessly repeats every (textureWidth × textureHeight) world pixels.
 */
function tilingMatrix(tex: Texture): Matrix {
  return new Matrix().scale(1 / tex.width, 1 / tex.height);
}
