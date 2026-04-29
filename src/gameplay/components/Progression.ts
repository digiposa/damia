/**
 * Character progression — TLoD's LV / EXP / next-level threshold. Lives on the
 * player only for now; if mobs ever scale by level we add it to spawnMob.
 *
 * `xpToNext` is the *threshold* (cumulative target). On level-up, advance
 * `level` by 1, subtract `xpToNext` from `xp`, and recompute `xpToNext` via
 * the curve helper in `data/progression.ts`.
 */
export interface Progression {
  level: number;
  xp: number;
  xpToNext: number;
}
