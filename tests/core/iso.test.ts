import { describe, expect, it } from 'vitest';
import { gridToWorld, worldToGrid, TILE_HALF_W, TILE_HALF_H } from '@core/math/iso';

describe('iso projection', () => {
  it('origin maps to origin', () => {
    expect(gridToWorld(0, 0)).toEqual({ x: 0, y: 0 });
    expect(worldToGrid(0, 0)).toEqual({ x: 0, y: 0 });
  });

  it('gridToWorld then worldToGrid is identity', () => {
    for (const [gx, gy] of [
      [3, 5],
      [10, 0],
      [0, 7],
      [12, 12],
    ] as const) {
      const w = gridToWorld(gx, gy);
      const g = worldToGrid(w.x, w.y);
      expect(g.x).toBeCloseTo(gx, 6);
      expect(g.y).toBeCloseTo(gy, 6);
    }
  });

  it('moving +1 on gx shifts world east-south', () => {
    expect(gridToWorld(1, 0)).toEqual({ x: TILE_HALF_W, y: TILE_HALF_H });
  });

  it('moving +1 on gy shifts world west-south', () => {
    expect(gridToWorld(0, 1)).toEqual({ x: -TILE_HALF_W, y: TILE_HALF_H });
  });
});
