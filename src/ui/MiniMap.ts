import type { Application } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import type { World } from '@core/ecs';
import { TILE_HALF_H, TILE_HALF_W, gridToWorld, worldToGrid } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import type { TileMapPathZone } from '@rendering/TileMap';

const MAP_FIT_PX = 200;
const PADDING = 12;

interface MiniMapOptions {
  gridWidth: number;
  gridHeight: number;
  pathZones: readonly TileMapPathZone[];
}

/**
 * Top-right toggleable minimap. Iso-projected so the rendered shape matches the
 * playable area: the grid (0..W-1, 0..H-1) maps to a 2:1 diamond. Static layer
 * (frame + path zones) is drawn once; dynamic layer (player + enemies + exits)
 * redraws each tick.
 *
 * Coordinate system inside the container:
 *   - The iso-projected world bbox is normalised to fit in MAP_FIT_PX.
 *   - All children use `projectGrid(gx, gy)` to translate grid coords into
 *     local pixel positions.
 */
export class MiniMap {
  readonly container: Container;
  private readonly background: Graphics;
  private readonly staticLayer: Graphics;
  private readonly dynamicLayer: Graphics;
  private readonly gridWidth: number;
  private readonly gridHeight: number;
  /** World→minimap scale and offset so projected coords land inside the bbox. */
  private readonly scale: number;
  private readonly offsetX: number;
  private readonly offsetY: number;
  /** Final bbox of the diamond after scaling — used for layout / repositioning. */
  private readonly bboxW: number;
  private readonly bboxH: number;
  private app: Application;
  private cleanupKey: (() => void) | null = null;

  constructor(app: Application, opts: MiniMapOptions) {
    this.app = app;
    this.gridWidth = opts.gridWidth;
    this.gridHeight = opts.gridHeight;

    // Iso bbox of the grid (0,0)..(W-1, H-1) in world px:
    //  width  = (W + H - 2) * TILE_HALF_W
    //  height = (W + H - 2) * TILE_HALF_H
    // (TILE_HALF_W = 64, TILE_HALF_H = 32 → height = width / 2.)
    const span = opts.gridWidth + opts.gridHeight - 2;
    const isoW = span * TILE_HALF_W;
    const isoH = span * TILE_HALF_H;
    this.scale = MAP_FIT_PX / Math.max(isoW, isoH);
    // gridToWorld puts (0,0) at world (0,0); the leftmost point is (0, H-1) at
    // world x = -(H-1)*TILE_HALF_W. Shift everything so the diamond starts at x=0.
    this.offsetX = (opts.gridHeight - 1) * TILE_HALF_W * this.scale;
    this.offsetY = 0;
    this.bboxW = isoW * this.scale;
    this.bboxH = isoH * this.scale;

    this.container = new Container({ label: 'minimap' });

    // Background = the iso diamond itself (top / right / bottom / left points).
    this.background = new Graphics()
      .poly([
        this.bboxW / 2,
        0,
        this.bboxW,
        this.bboxH / 2,
        this.bboxW / 2,
        this.bboxH,
        0,
        this.bboxH / 2,
      ])
      .fill({ color: 0x000000, alpha: 0.6 })
      .stroke({ width: 1, color: 0xa08050, alpha: 0.7 });

    // Path zones become parallelograms (4 grid corners projected through iso).
    this.staticLayer = new Graphics();
    for (const z of opts.pathZones) {
      const x0 = z.x;
      const y0 = z.y;
      const x1 = z.x + z.w;
      const y1 = z.y + z.h;
      const a = this.projectGrid(x0, y0);
      const b = this.projectGrid(x1, y0);
      const c = this.projectGrid(x1, y1);
      const d = this.projectGrid(x0, y1);
      this.staticLayer
        .poly([a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y])
        .fill({ color: 0x6e4a2c, alpha: 0.6 });
    }

    this.dynamicLayer = new Graphics();
    this.container.addChild(this.background, this.staticLayer, this.dynamicLayer);

    this.reposition();
    app.renderer.on('resize', () => this.reposition());

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'm' || e.key === 'M') this.container.visible = !this.container.visible;
    };
    window.addEventListener('keydown', onKey);
    this.cleanupKey = () => window.removeEventListener('keydown', onKey);
  }

  /** Redraws all dynamic dots from the world state. Called each frame. */
  update(world: World<Components>): void {
    if (!this.container.visible) return;
    const g = this.dynamicLayer.clear();

    for (const id of world.query(['Exit'])) {
      const e = world.getComponent(id, 'Exit');
      if (!e) continue;
      const color = e.kind === 'transition' ? 0xffd060 : 0x808080;
      this.dot(g, e.gx, e.gy, 4, color);
    }

    for (const id of world.query(['Faction', 'Position', 'Health'])) {
      const fac = world.getComponent(id, 'Faction');
      const pos = world.getComponent(id, 'Position');
      if (!fac || !pos) continue;
      if (fac.side === 'player') continue;
      const grid = worldToGrid(pos.x, pos.y);
      this.dot(g, Math.round(grid.x), Math.round(grid.y), 3, 0xff6060);
    }

    for (const id of world.query(['Player', 'Position'])) {
      const pos = world.getComponent(id, 'Position');
      if (!pos) continue;
      const grid = worldToGrid(pos.x, pos.y);
      this.dot(g, Math.round(grid.x), Math.round(grid.y), 4, 0x60d8ff);
    }
  }

  destroy(): void {
    this.cleanupKey?.();
    this.cleanupKey = null;
    this.container.destroy({ children: true });
  }

  /** Project a grid cell (gx, gy) to local minimap coords. */
  private projectGrid(gx: number, gy: number): { x: number; y: number } {
    const w = gridToWorld(gx, gy);
    return { x: w.x * this.scale + this.offsetX, y: w.y * this.scale + this.offsetY };
  }

  private dot(g: Graphics, gx: number, gy: number, radius: number, color: number): void {
    if (gx < 0 || gy < 0 || gx >= this.gridWidth || gy >= this.gridHeight) return;
    const p = this.projectGrid(gx, gy);
    g.circle(p.x, p.y, radius).fill(color);
  }

  private reposition(): void {
    this.container.position.set(this.app.screen.width - this.bboxW - PADDING, PADDING);
  }
}
