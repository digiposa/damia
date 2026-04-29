/**
 * One-shot visual effect entity. Owned by VfxSystem in the FX layer:
 * spawns a Pixi node when the entity appears, ticks `elapsedMs`, animates a
 * shape based on `kind`, and destroys the entity when `elapsedMs >= durationMs`.
 *
 * `kind` is the open-ended discriminant — add a new value here AND a matching
 * draw routine in VfxSystem when wiring a new elemental spell.
 */
export type VfxKind = 'flameBurst' | 'fireImpact' | 'clickMove' | 'clickAttack';

export interface Vfx {
  kind: VfxKind;
  elapsedMs: number;
  durationMs: number;
  /** Geometry size hint (e.g. flame burst end radius). */
  radius: number;
}
