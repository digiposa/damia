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
  /** Visual scale multiplier. Default 1. */
  scale?: number;
  /**
   * Texture-fit strategy (textured sprites only):
   *  - `'contain'` (default): fit to (width × height) box, preserving aspect (Math.min ratio).
   *  - `'height'`: fit by height only, width allowed to overflow. Use for characters
   *    so wider attack poses (sword out) keep the same on-screen height as the idle.
   */
  fitMode?: 'contain' | 'height';
  /** Asset alias (M8). If set, render as textured Pixi.Sprite instead of Graphics shape. */
  textureAlias?: AssetAlias;
  /** Optional alias used while the entity has an AttackSwing component (live texture swap). */
  attackTextureAlias?: AssetAlias;
  /** Optional alias used while the entity has a Defending component (held pose). */
  defendTextureAlias?: AssetAlias;
  /** Optional alias used while the entity has a Dying component. Triggers the death-animation pipeline. */
  deathTextureAlias?: AssetAlias;
  /** Rotation in radians, applied to the rendered Pixi node. Defaults
   *  to 0. Used by Projectile arrows to point along their flight path
   *  — RenderSystem reads this each frame, so updating it on the
   *  component immediately re-orients the sprite. */
  rotation?: number;
  /** Source-art is drawn facing left (the screen-left half of the iso
   *  axes). When true, RenderSystem horizontally mirrors the sprite
   *  whenever the entity is moving rightwards (positive world dx),
   *  preserving its size via `scale.x = -scale`. Last facing is
   *  retained when the entity is idle so the character keeps looking
   *  in the direction they last moved. Default false → no mirroring,
   *  legacy behaviour. */
  mirrorOnFacingRight?: boolean;
}

// NB: addition frame sequences are NOT stored here. RenderSystem resolves
// them at draw time from `Character.avatar.sprite.base.additions[kind]` for
// the entity's currently active `Addition.kind`. Keeps the (avatar, addition)
// → frame mapping centralized on CharacterAvatar (single source of truth),
// and makes Story-mode avatar swaps (Lavitz → Albert) plus skin variants
// (Shana/Miranda/Shirley) "just work" without re-pushing data onto Sprite.
