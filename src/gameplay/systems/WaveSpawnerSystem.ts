import type { Entity, System, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { spawnMob } from '@gameplay/entities/mobs';
import type { MobKind } from '@data/balance';

/** Mix of mobs to drip across a single wave window. The order doesn't
 *  matter — the spawner shuffles the merged queue so two consecutive
 *  identical wave plans still play differently. */
export type WaveSpawnList = ReadonlyArray<{ kind: MobKind; count: number }>;

export interface WaveSpawnerOptions {
  /** Length of each wave window (ms). Spawns drip evenly across it. */
  waveDurationMs: number;
  /** Procedural wave generator — called once on each wave activation
   *  with the new wave's index (0-based). Lets the scene scale
   *  difficulty mathematically instead of hand-authoring a fixed list,
   *  which is what we want for an endless mode. */
  buildWave: (waveIdx: number) => WaveSpawnList;
  arenaSize: { width: number; height: number };
  /** Cell walkability check — same predicate the pathfinder uses, so a
   *  mob never spawns on a blocked tile. */
  isWalkable: (gx: number, gy: number) => boolean;
  getPlayerEntity: () => Entity | null;
  /** Min world-px distance from the player at which a mob may spawn so
   *  mobs don't appear on top of the camera-locked player. ~ 8 tile
   *  diagonals (572 px) keeps them comfortably off-screen at zoom 0.7. */
  minPlayerDistPx: number;
  /** Called for every successful spawn so the scene can record the kind
   *  (death XP, kill counter, future drop tables). */
  onSpawn: (entity: Entity, kind: MobKind) => void;
}

/**
 * Endless-mode wave director. Sits outside the controller's ECS pipeline
 * (the scene ticks it directly) so survival-specific logic doesn't leak
 * into the shared engine. Each frame:
 *
 *   1. Compute the active wave index from `elapsedMs / waveDurationMs`.
 *   2. On wave change, ask `buildWave(idx)` for the new mob mix, flatten
 *      + shuffle it into a spawn queue, schedule the first drip.
 *   3. Drip queued mobs across the wave window. Each spawn picks a
 *      random arena-edge cell that's walkable and far enough from the
 *      player, then seeds CombatIntent + a giant aggroRange so the mob
 *      chases from spawn instead of idling at the edge (default
 *      aggroRange ≤ 320 px is much smaller than the arena diagonal).
 *
 * Mobs that survive past their wave's window keep chasing — only the
 * unsent spawn queue is dropped when the window closes, never live
 * entities.
 */
export class WaveSpawnerSystem implements System<Components> {
  private elapsedMs = 0;
  private currentWaveIdx = -1;
  private spawnQueue: MobKind[] = [];
  private nextSpawnAtMs = 0;

  constructor(private readonly opts: WaveSpawnerOptions) {}

  update(dt: number, world: World<Components>): void {
    this.elapsedMs += dt;
    this.advanceWave();
    this.dripSpawns(world);
  }

  /** Active wave index (0-based). -1 only on the very first frame, before
   *  any update tick has run. */
  get currentWave(): number {
    return this.currentWaveIdx;
  }

  /** Fraction (0..1) of progress through the active wave's window.
   *  Used by the HUD to paint a wave-timer pip. */
  waveProgress(): number {
    if (this.currentWaveIdx < 0) return 0;
    const startMs = this.currentWaveIdx * this.opts.waveDurationMs;
    const elapsedInWave = this.elapsedMs - startMs;
    return Math.max(0, Math.min(1, elapsedInWave / this.opts.waveDurationMs));
  }

  private advanceWave(): void {
    const idx = Math.floor(this.elapsedMs / this.opts.waveDurationMs);
    if (idx === this.currentWaveIdx) return;
    this.currentWaveIdx = idx;
    const plan = this.opts.buildWave(idx);
    this.spawnQueue = [];
    for (const s of plan) {
      for (let i = 0; i < s.count; i++) this.spawnQueue.push(s.kind);
    }
    // Fisher-Yates shuffle so consecutive runs vary.
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = this.spawnQueue[i]!;
      this.spawnQueue[i] = this.spawnQueue[j]!;
      this.spawnQueue[j] = tmp;
    }
    // 250 ms grace so a future "Wave N" HUD flash plays before the first
    // mob appears — feels less abrupt than spawn-on-tick.
    this.nextSpawnAtMs = this.elapsedMs + 250;
  }

  private dripSpawns(world: World<Components>): void {
    if (this.spawnQueue.length === 0) return;
    const startMs = this.currentWaveIdx * this.opts.waveDurationMs;
    const waveEndMs = startMs + this.opts.waveDurationMs;
    const remaining = waveEndMs - this.elapsedMs;
    if (remaining <= 0) {
      // Window closed. Drop unsent spawns; the next wave's plan replaces
      // them. Live mobs are unaffected.
      this.spawnQueue = [];
      return;
    }
    while (this.elapsedMs >= this.nextSpawnAtMs && this.spawnQueue.length > 0) {
      const kind = this.spawnQueue.shift()!;
      this.spawnAt(world, kind);
      const interval = remaining / Math.max(1, this.spawnQueue.length + 1);
      this.nextSpawnAtMs = this.elapsedMs + interval;
    }
  }

  /** Per-wave compounding scalars applied to a freshly-spawned mob.
   *  Wave 0 = base stats; each subsequent wave multiplies HP and ATK
   *  by these factors. Chosen so that at wave 10 mobs deal real
   *  damage to a LV10 Dart (overcoming his DEF clamp) and at wave 20
   *  a mob swarm becomes a credible threat against a fully-upgraded
   *  player. Tune by feel — the formula lives on the spawner so the
   *  WaveSpawner stays the single tuning lever for arena pacing. */
  private hpScalar(waveIdx: number): number {
    return Math.pow(1.07, Math.max(0, waveIdx));
  }
  private atkScalar(waveIdx: number): number {
    return Math.pow(1.12, Math.max(0, waveIdx));
  }

  private spawnAt(world: World<Components>, kind: MobKind): void {
    const playerId = this.opts.getPlayerEntity();
    const playerPos = playerId !== null ? world.getComponent(playerId, 'Position') : null;
    const { width, height } = this.opts.arenaSize;
    const minDistPx = this.opts.minPlayerDistPx;
    for (let attempts = 0; attempts < 24; attempts++) {
      const edge = Math.floor(Math.random() * 4);
      let gx = 0;
      let gy = 0;
      // 4 edges with a 1-tile inset so mobs don't sit literally on the
      // map border (avoids edge-case path requests onto the border).
      switch (edge) {
        case 0:
          gx = 1 + Math.floor(Math.random() * (width - 2));
          gy = 1;
          break;
        case 1:
          gx = 1 + Math.floor(Math.random() * (width - 2));
          gy = height - 2;
          break;
        case 2:
          gx = 1;
          gy = 1 + Math.floor(Math.random() * (height - 2));
          break;
        default:
          gx = width - 2;
          gy = 1 + Math.floor(Math.random() * (height - 2));
          break;
      }
      if (!this.opts.isWalkable(gx, gy)) continue;
      if (playerPos) {
        const w = gridToWorld(gx, gy);
        const dist = Math.hypot(w.x - playerPos.x, w.y - playerPos.y);
        if (dist < minDistPx) continue;
      }
      const id = spawnMob(world, kind, gx, gy);
      // Force-engage: the default aggroRange (≤ 320 px) is much smaller
      // than the arena diagonal, so without this the mob would idle at
      // the edge until the player wandered close. Pre-seeding
      // CombatIntent + a giant aggroRange makes it chase from spawn —
      // which is the whole point of a Survival arena.
      if (playerId !== null) {
        world.addComponent(id, 'CombatIntent', { targetId: playerId });
      }
      const stats = world.getComponent(id, 'Stats');
      if (stats) stats.aggroRange = 99_999;
      // Per-wave stat scaling. Multiplicative on Stats.atk and on
      // Health.max so that high-wave swarms can actually deplete a
      // leveled Dart's HP (which would otherwise stay full once mob
      // ATK falls below his DEF and the damage formula clamps to 1).
      // HP scales softer than ATK so mobs don't become bullet-spongey
      // — the design intent is "they hit harder", not "they take
      // longer to kill".
      const hpFactor = this.hpScalar(this.currentWaveIdx);
      const atkFactor = this.atkScalar(this.currentWaveIdx);
      if (stats) stats.atk = Math.round(stats.atk * atkFactor);
      const hp = world.getComponent(id, 'Health');
      if (hp) {
        hp.max = Math.round(hp.max * hpFactor);
        hp.current = hp.max;
      }
      this.opts.onSpawn(id, kind);
      return;
    }
    // 24 failed attempts → give up silently. Next drip tick retries.
  }
}
