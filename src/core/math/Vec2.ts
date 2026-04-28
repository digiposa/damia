export interface Vec2 {
  x: number;
  y: number;
}

export const Vec2 = {
  create(x = 0, y = 0): Vec2 {
    return { x, y };
  },
  clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y };
  },
  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },
  sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },
  scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s };
  },
  length(v: Vec2): number {
    return Math.hypot(v.x, v.y);
  },
  distance(a: Vec2, b: Vec2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  },
} as const;
