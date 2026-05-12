/**
 * Survival run high-score persistence. Stores the top-N runs by `ms`
 * (time survived) under a dedicated localStorage key, distinct from
 * the Story save record so meta-progression can grow independently.
 *
 * Schema is versioned (`v1`) on the key itself — bump the suffix when
 * the shape changes so old runs are cleanly ignored instead of
 * deserialising into invalid records.
 */
import type { CharacterId } from '@data/characters';

export interface SurvivalRunRecord {
  /** Time survived during the run, in milliseconds. */
  ms: number;
  /** Highest wave reached (1-based, matches the SurvivalHUD display). */
  wave: number;
  /** Total mobs killed during the run. */
  kills: number;
  /** Character level reached (from the player entity's Progression). */
  level: number;
  /** Active character id. Future leaderboard splits per-character
   *  unlock criteria off this. */
  character: CharacterId;
  /** Wall-clock timestamp when the record was saved — used to break
   *  ties on equal ms and to display "X days ago" later if we want it. */
  savedAtMs: number;
}

const KEY = 'damia.survivalScores.v1';
const TOP_N = 5;

class RunHighScoresService {
  load(): SurvivalRunRecord[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((r): r is SurvivalRunRecord => this.isRecord(r)).slice(0, TOP_N);
    } catch {
      return [];
    }
  }

  /**
   * Insert a new run, re-sort the table by `ms` descending, trim to
   * top N, persist. Returns the 0-based rank of the submitted record
   * inside the trimmed table — or -1 if the run didn't make the cut.
   * The scene reads the rank to decide whether to show "Nouveau
   * record !" and which line to highlight in the leaderboard.
   */
  submit(record: SurvivalRunRecord): number {
    const scores = this.load();
    scores.push(record);
    // Primary: longer ms wins. Tiebreaker: more recent savedAtMs (so
    // a fresh equal-length run still bubbles up over a months-old one).
    scores.sort((a, b) => {
      if (b.ms !== a.ms) return b.ms - a.ms;
      return b.savedAtMs - a.savedAtMs;
    });
    const trimmed = scores.slice(0, TOP_N);
    const rank = trimmed.indexOf(record);
    try {
      localStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[RunHighScores] failed to persist run table:', e);
    }
    return rank;
  }

  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }

  private isRecord(x: unknown): x is SurvivalRunRecord {
    if (typeof x !== 'object' || x === null) return false;
    const r = x as Record<string, unknown>;
    return (
      typeof r.ms === 'number' &&
      typeof r.wave === 'number' &&
      typeof r.kills === 'number' &&
      typeof r.level === 'number' &&
      typeof r.character === 'string' &&
      typeof r.savedAtMs === 'number'
    );
  }
}

export const RunHighScores = new RunHighScoresService();
