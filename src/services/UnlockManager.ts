/**
 * Persistent set of unlocked playable characters for the Survival
 * meta-progression. Dart is always unlocked; others gate behind
 * run-record criteria (see `evaluateUnlocks`).
 *
 * Storage: localStorage key `damia.unlocks.v1`, JSON-encoded array
 * of character ids. Schema version is on the key itself — bump the
 * suffix when the structure changes so legacy entries are cleanly
 * ignored.
 */
import type { CharacterId } from '@data/characters';
import type { SurvivalRunRecord } from './RunHighScores';

const KEY = 'damia.unlocks.v1';

/** Characters available from the first launch — no criteria. */
const ALWAYS_UNLOCKED: ReadonlyArray<CharacterId> = ['dart'];

/**
 * Unlock criteria per character. Pure function: returns true if the
 * just-finished run is enough to unlock the given character. Kept
 * declarative so we can later surface the "how to unlock" hint to
 * the selector card without re-implementing the logic.
 */
const UNLOCK_CRITERIA: Partial<Record<CharacterId, (record: SurvivalRunRecord) => boolean>> = {
  // Shana — first meta-unlock. Reach wave 5 in any Survival run.
  // Hits ~ 2 min in so first-time players bump into it during their
  // second or third attempt. Easy to bump later if the bar feels off.
  shana: (r) => r.wave >= 5,
};

class UnlockManagerService {
  private cached: Set<CharacterId> | null = null;

  /** Lazy-loaded set of unlocked character ids. Always-unlocked
   *  characters are merged in so callers don't have to special-case
   *  Dart. */
  unlocked(): Set<CharacterId> {
    if (this.cached) return this.cached;
    const persisted = this.readPersisted();
    const set = new Set<CharacterId>(ALWAYS_UNLOCKED);
    for (const id of persisted) set.add(id);
    this.cached = set;
    return set;
  }

  isUnlocked(id: CharacterId): boolean {
    return this.unlocked().has(id);
  }

  /**
   * Test the run against every gated character. Returns the list of
   * characters that just transitioned from locked → unlocked (empty
   * if nothing new). Side effect: persists the new set to
   * localStorage when at least one entry was added.
   */
  evaluateUnlocks(record: SurvivalRunRecord): CharacterId[] {
    const current = this.unlocked();
    const newly: CharacterId[] = [];
    for (const [id, criterion] of Object.entries(UNLOCK_CRITERIA) as Array<
      [CharacterId, (r: SurvivalRunRecord) => boolean]
    >) {
      if (current.has(id)) continue;
      if (!criterion(record)) continue;
      current.add(id);
      newly.push(id);
    }
    if (newly.length > 0) this.writePersisted();
    return newly;
  }

  /** Lower-level escape hatch for cheat-mode / debug — directly add
   *  to the persisted set without going through a run record. */
  forceUnlock(id: CharacterId): void {
    const set = this.unlocked();
    if (set.has(id)) return;
    set.add(id);
    this.writePersisted();
  }

  /** Wipe the persisted unlocks (cheat-mode reset). Always-unlocked
   *  characters still appear in subsequent `unlocked()` reads
   *  because they're seeded from the constant. */
  clear(): void {
    this.cached = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }

  private readPersisted(): CharacterId[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x): x is CharacterId => typeof x === 'string');
    } catch {
      return [];
    }
  }

  private writePersisted(): void {
    const set = this.cached;
    if (!set) return;
    try {
      // ALWAYS_UNLOCKED is implicit at read time so we don't bloat
      // the persisted blob with constants. Strip them before writing.
      const out: CharacterId[] = [];
      for (const id of set) {
        if (!ALWAYS_UNLOCKED.includes(id)) out.push(id);
      }
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) {
      console.warn('[UnlockManager] failed to persist unlocks:', e);
    }
  }
}

export const UnlockManager = new UnlockManagerService();

/** Exposed so the CharacterSelectScene can render the "how to
 *  unlock" hint without duplicating the logic. Returns null for
 *  characters that aren't gated. */
export const UNLOCK_HINT_KEYS: Partial<Record<CharacterId, string>> = {
  shana: 'characterSelect.unlockHint.shana',
};
