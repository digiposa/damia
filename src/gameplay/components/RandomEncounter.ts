/**
 * Tag component placed on mobs spawned by EncounterSystem (random encounters)
 * to distinguish them from scripted/placed mobs from MapLoader. EncounterSystem
 * uses this to enforce `maxConcurrentRandomMobs` without affecting hand-placed
 * encounters.
 */
export interface RandomEncounter {
  /** Stamp of the encounter event that spawned this mob (ms). Useful later for
   *  loot tweaks per "wave"; harmless if unused for now. */
  spawnedAtMs: number;
}
