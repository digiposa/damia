import type { GameContext } from '@/Game';
import type { Scene } from '../Scene';
import { TileMap } from '@rendering/TileMap';
import { createCamera } from '@rendering/Camera';
import { Layers } from '@rendering/Layers';
import type { Viewport } from 'pixi-viewport';

const GRID_SIZE = 32;

export class ForestScene implements Scene {
  readonly name = 'forest';
  private layers: Layers | null = null;
  private viewport: Viewport | null = null;
  private tilemap: TileMap | null = null;

  enter(ctx: GameContext): void {
    this.tilemap = new TileMap({ width: GRID_SIZE, height: GRID_SIZE });
    const bounds = this.tilemap.worldBounds();

    this.viewport = createCamera(ctx.app, {
      worldWidth: bounds.width,
      worldHeight: bounds.height,
    });
    ctx.app.stage.addChild(this.viewport);

    this.layers = new Layers();
    this.layers.mountWorld(this.viewport);
    this.layers.mountUi(ctx.app.stage);

    // Offset tilemap so its world bounds start at (0, 0) inside the viewport.
    this.tilemap.container.position.set(-bounds.minX, -bounds.minY);
    this.layers.ground.addChild(this.tilemap.container);

    // Center the camera on the middle of the grid.
    this.viewport.moveCenter(bounds.width / 2, bounds.height / 2);
  }

  exit(ctx: GameContext): void {
    if (this.viewport) {
      ctx.app.stage.removeChild(this.viewport);
      this.viewport.destroy({ children: true });
      this.viewport = null;
    }
    if (this.layers) {
      this.layers.destroy();
      this.layers = null;
    }
    this.tilemap = null;
  }

  update(): void {
    // M1: static scene. M2 will tick player here.
  }
}
