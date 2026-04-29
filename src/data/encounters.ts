import type { MobKind } from './balance';

export type EncounterZoneId = 'forest';

export interface EncounterPoolEntry {
  kind: MobKind;
  /** Pick weight inside the pool (relative; doesn't need to sum to 1). */
  weight: number;
  /** Group size sampled uniformly in [min, max] when this entry is rolled. */
  groupSize: { min: number; max: number };
}

export interface EncounterZone {
  /** Distance the player must walk for the encounter meter to fill once. */
  pxPerEncounter: number;
  /** Cap on simultaneous random-spawned mobs in the zone (scripted mobs don't count). */
  maxConcurrentRandomMobs: number;
  pool: ReadonlyArray<EncounterPoolEntry>;
}

export const ENCOUNTERS: Record<EncounterZoneId, EncounterZone> = {
  forest: {
    pxPerEncounter: 800,
    maxConcurrentRandomMobs: 5,
    pool: [
      { kind: 'berserkMouse', weight: 0.5, groupSize: { min: 1, max: 2 } },
      { kind: 'goblin', weight: 0.3, groupSize: { min: 1, max: 1 } },
      { kind: 'assassinCock', weight: 0.2, groupSize: { min: 1, max: 1 } },
      // trent stays scripted only — too tanky for random pulls
    ],
  },
};

/** Pick a pool entry by weight. `roll` is a [0, 1) random factor (injected for testability). */
export function pickEncounterEntry(zone: EncounterZone, roll: number): EncounterPoolEntry {
  const total = zone.pool.reduce((s, e) => s + e.weight, 0);
  let acc = roll * total;
  for (const e of zone.pool) {
    acc -= e.weight;
    if (acc <= 0) return e;
  }
  return zone.pool[zone.pool.length - 1]!; // fallback for floating-point rounding
}

/** Sample group size uniformly in [min, max], inclusive. */
export function pickGroupSize(entry: EncounterPoolEntry, roll: number): number {
  const { min, max } = entry.groupSize;
  return min + Math.floor(roll * (max - min + 1));
}
