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
  /** Optional alias used while the entity has a Spell component (mob
   *  casters only — Commander's Burn Out wind-up pose, future
   *  caster mobs). Player casters skip this since the spell VFX is
   *  the canonical cast signal for them. */
  castTextureAlias?: AssetAlias;
  /** Optional alias used while the entity has a Dying component. Triggers the death-animation pipeline. */
  deathTextureAlias?: AssetAlias;
  /** Optional multi-frame death animation. RenderSystem splits the
   *  Dying.totalMs duration evenly across these frames and freezes
   *  on the last frame for the remaining death gate before
   *  DyingSystem destroys the entity. Used by mobs with a dedicated
   *  death sequence (Commander's collapse, future bosses); single-
   *  pose deaths can keep just `deathTextureAlias`. */
  deathFrames?: ReadonlyArray<AssetAlias>;
  /** Optional multi-frame walk-cycle animation for non-Character
   *  entities (mobs). RenderSystem cycles through these frames at the
   *  shared WALK_FRAME_MS rate while the entity has active Pathfinder
   *  waypoints (no swing / addition / spell / defend taking over).
   *  Players ignore this field — their walk cycle reads from
   *  `Character.avatar.sprite.base.walkFrames` instead. */
  walkFrames?: ReadonlyArray<AssetAlias>;
  /** Optional multi-frame basic-attack animation for non-Character
   *  entities (mobs). RenderSystem splits the AttackSwing duration
   *  evenly across the frames — same logic as the player path that
   *  reads `Character.avatar.sprite.base.attackFrames`. Falls back to
   *  the single `attackTextureAlias` when this is empty / unset. */
  attackFrames?: ReadonlyArray<AssetAlias>;
  /** Optional multi-frame ranged-throw animation, picked by RenderSystem
   *  when the entity has an `AttackSwing` with `kind: 'throw'`. Knight
   *  of Sandora's "Throw Dagger" is the first user — same split-by-
   *  elapsed math as attackFrames. */
  throwFrames?: ReadonlyArray<AssetAlias>;
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

/**
 * Convention defaults for every character-like Sprite (player, mobs, NPCs
 * — anything humanoid that pathfinds and faces its direction of travel).
 * Spawners spread this first and let the entity-specific spec override
 * what it needs:
 *
 *   world.addComponent(id, 'Sprite', {
 *     ...CHARACTER_SPRITE_DEFAULTS,
 *     shape: 'capsule', color: 0xc8201f, width: 54, height: 81,
 *     textureAlias: avatar.sprite.base.idle,
 *     // ...
 *   });
 *
 * Project art convention: every character sprite is drawn facing
 * **screen-left**. `mirrorOnFacingRight: true` lets RenderSystem flip
 * the texture horizontally when the entity walks rightwards, so we
 * only have to produce one set of poses per character. A mob whose
 * source art happens to face the other way (or is fully symmetric)
 * can opt out per-entry with `mirrorOnFacingRight: false`.
 *
 * `fitMode: 'height'` keeps wider attack poses at a consistent
 * on-screen character height; `layer: 'entities'` is the only render
 * layer that picks up Pathfinder / iso z-sort.
 */
export const CHARACTER_SPRITE_DEFAULTS = {
  layer: 'entities',
  fitMode: 'height',
  mirrorOnFacingRight: true,
} as const satisfies Partial<Sprite>;
