import type { GameContext } from '@/Game';

export interface Scene {
  readonly name: string;
  enter(ctx: GameContext): void | Promise<void>;
  exit(ctx: GameContext): void | Promise<void>;
  update(dt: number, ctx: GameContext): void;
}
