import type { MobKind } from './balance';
import type { WaveSpawnList } from '@gameplay/systems/WaveSpawnerSystem';

/** Wave window length. 30 s gives the player a beat to clear the
 *  current spawns before the next mix lands. */
export const ARENA_WAVE_DURATION_MS = 30_000;

/** Min distance a spawn may be from the player (world px). ~ 8 tile
 *  diagonals — well off-camera at zoom 0.7 (camera half-width ≈ 785 px)
 *  so mobs always walk in from the edge instead of materialising on the
 *  player's head. */
export const ARENA_MIN_SPAWN_DIST_PX = 572;

/**
 * Procedural difficulty curve for the endless arena. Tier rolls every 5
 * waves (≈ 2.5 min). Mob kinds gate-in progressively so the early game
 * teaches one thing at a time, then pile up:
 *
 *   tier 0 (waves 0-4)   : berserkMouse only, light count.
 *   tier 1 (waves 5-9)   : adds goblin.
 *   tier 2 (waves 10-14) : more of both.
 *   tier 3 (waves 15-19) : adds assassinCock (ranged retreat → forces
 *                          melee chase against a moving target).
 *   tier 4 (waves 20-24) : pile-up.
 *   tier 5+ (waves 25+)  : adds trent (slow + tanky), counts keep
 *                          rising linearly. No cap by design — the
 *                          player decides when to die.
 *
 * Mini-boss every 5 waves (4, 9, 14, …): one extra trent dropped into
 * the mix, even at low tiers, so the wave-end carries weight.
 *
 * Tuning lever: edit `tier` math + per-kind counts. Wave count is
 * read off the current run elapsed-time, not stored, so the curve can
 * be retuned without invalidating in-flight runs.
 */
export function buildArenaWave(idx: number): WaveSpawnList {
  const tier = Math.floor(idx / 5);
  const spawns: { kind: MobKind; count: number }[] = [];
  spawns.push({ kind: 'berserkMouse', count: 2 + tier });
  if (tier >= 1) spawns.push({ kind: 'goblin', count: tier });
  if (tier >= 3) spawns.push({ kind: 'assassinCock', count: tier - 2 });
  if (tier >= 5) spawns.push({ kind: 'trent', count: tier - 4 });
  if ((idx + 1) % 5 === 0) spawns.push({ kind: 'trent', count: 1 });
  return spawns;
}
