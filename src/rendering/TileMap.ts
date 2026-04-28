import { Container, Graphics } from 'pixi.js';
import { TILE_HALF_H, TILE_HALF_W, gridToWorld } from '@core/math/iso';

export interface TileMapOptions {
  width: number;
  height: number;
  /** Two colors used for the debug checker pattern. */
  colors?: [number, number];
}

const DEFAULT_COLORS: [number, number] = [0x3a5a3f, 0x2e4a32];

/**
 * M1 placeholder tilemap: draws a flat WxH iso grid as colored diamonds.
 * Will be replaced by @pixi/tilemap with real textures in M3+.
 */
export class TileMap {
  readonly container: Container;
  readonly width: number;
  readonly height: number;

  constructor(opts: TileMapOptions) {
    this.width = opts.width;
    this.height = opts.height;
    this.container = new Container({ label: 'tilemap' });

    const colors = opts.colors ?? DEFAULT_COLORS;
    this.draw(colors);
  }

  private draw(colors: [number, number]): void {
    const g = new Graphics();
    for (let gy = 0; gy < this.height; gy++) {
      for (let gx = 0; gx < this.width; gx++) {
        const center = gridToWorld(gx, gy);
        const color = (gx + gy) % 2 === 0 ? colors[0] : colors[1];
        // Diamond centered on (center.x, center.y)
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

  /** World pixel bounds that contain the entire grid (for camera setup). */
  worldBounds(): { width: number; height: number; minX: number; minY: number } {
    // Leftmost world.x is at gx=0, gy=height-1; rightmost at gx=width-1, gy=0
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
