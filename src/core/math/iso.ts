import type { Vec2 } from './Vec2';

export const TILE_W = 128;
export const TILE_H = 64;
export const TILE_HALF_W = TILE_W / 2;
export const TILE_HALF_H = TILE_H / 2;

export function gridToWorld(gx: number, gy: number): Vec2 {
  return {
    x: (gx - gy) * TILE_HALF_W,
    y: (gx + gy) * TILE_HALF_H,
  };
}

export function worldToGrid(wx: number, wy: number): Vec2 {
  return {
    x: (wx / TILE_HALF_W + wy / TILE_HALF_H) / 2,
    y: (wy / TILE_HALF_H - wx / TILE_HALF_W) / 2,
  };
}

export function isoZIndex(gx: number, gy: number): number {
  return gx + gy;
}
