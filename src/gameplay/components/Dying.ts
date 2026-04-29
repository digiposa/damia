/**
 * Death-animation gate. While present, the entity is rendered with its
 * `Sprite.deathTextureAlias` (if any) and frozen — DeathSystem strips its AI /
 * Pathfinder / combat intent on conversion. DyingSystem destroys the entity
 * once `elapsedMs >= totalMs`.
 */
export interface Dying {
  elapsedMs: number;
  totalMs: number;
}
