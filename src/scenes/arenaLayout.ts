/**
 * Shared arena geometry for the Survival and Training scenes — both use
 * the same flat square arena, so the dimensions live here rather than
 * being redeclared per scene.
 *
 * `ARENA_SIZE` is tuned so the iso diamond fits the prerendered arena
 * background; for a different background resolution recompute via
 * `ARENA_SIZE = Math.floor(imageWidth / (2 * TILE_HALF_W))` (see
 * `@core/math/iso`).
 */
export const ARENA_SIZE = 11;

/** Centre tile — the player's spawn in both arenas. */
export const SPAWN_GX = Math.floor(ARENA_SIZE / 2);
export const SPAWN_GY = Math.floor(ARENA_SIZE / 2);
