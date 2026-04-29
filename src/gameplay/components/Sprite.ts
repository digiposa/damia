import type { AssetAlias } from '@services/AssetManager';

export type SpriteShape = 'capsule' | 'circle' | 'diamond' | 'tree' | 'rock' | 'log' | 'roots';
export type SpriteLayer = 'ground' | 'entities' | 'fx';

/**
 * Pixi-agnostic visual config. The RenderSystem reads this and creates the actual Pixi node.
 *
 * If `textureAlias` is set, RenderSystem creates a `Pixi.Sprite` from the loaded
 * Texture (asset extracted from TLoD pack). Otherwise it falls back to a procedural
 * `Pixi.Graphics` using `shape` + `color` (used for Dart and any entity without a real asset).
 */
export interface Sprite {
  shape: SpriteShape;
  color: number;
  width: number;
  height: number;
  layer: SpriteLayer;
  /** Visual scale multiplier. Default 1; mutated by DefenseSystem to shrink the player while defending. */
  scale?: number;
  /** Asset alias (M8). If set, render as textured Pixi.Sprite instead of Graphics shape. */
  textureAlias?: AssetAlias;
  /** Optional alias used while the entity has an AttackSwing component (live texture swap). */
  attackTextureAlias?: AssetAlias;
  /** Optional alias used while the entity has a Dying component. Triggers the death-animation pipeline. */
  deathTextureAlias?: AssetAlias;
}
