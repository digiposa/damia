/**
 * Character data model. Anything that differs between two playable
 * characters lives on the `CharacterDef` record so the engine code
 * (spawnPlayer, DeathSystem, AdditionsBar, future ranged/melee combat
 * branches…) reads from the record instead of from per-character
 * hardcoded constants.
 *
 * Adding a new character is meant to be additive — drop a new file in
 * `src/data/characters/<name>.ts` exporting a `CharacterDef`, register
 * it in `src/data/characters/index.ts`. No engine code needs to know
 * its name.
 */
import type { Stats } from '@gameplay/components';
import type { AssetAlias } from '@services/AssetManager';

/** Known character roster. Keep in sync with the registry in
 *  `src/data/characters/index.ts`. */
export type CharacterId =
  | 'dart'
  | 'shana'
  | 'lavitz'
  | 'rose'
  | 'haschel'
  | 'albert'
  | 'meru'
  | 'kongol'
  | 'miranda';

/** TLoD-style elemental affinity. Used later by SpellSystem +
 *  enemy resistance tables. */
export type CharacterElement =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'thunder'
  | 'light'
  | 'darkness'
  | 'divine';

/** Combat archetype. v1 reads `melee` only — `ranged` will branch
 *  CombatSystem into projectile-spawn logic once Shana / Miranda
 *  ship. */
export type AttackPattern = 'melee' | 'ranged';

export interface CharacterLevelRow {
  level: number;
  hp: number;
  atk: number;
  def: number;
  magicAtk: number;
  magicDef: number;
}

/** Static config for one playable character. Immutable per-instance —
 *  every player entity carries a reference to the same `CharacterDef`
 *  object via its `Character` component. */
export interface CharacterDef {
  id: CharacterId;
  /** i18n key for the character's display name (selector / HUD). */
  displayNameKey: string;
  element: CharacterElement;
  attackPattern: AttackPattern;
  /** Action-RPG fields that don't scale per-level. Movement speed
   *  lives outside `base` because it maps to the `Speed` component,
   *  not `Stats`. */
  actionStats: {
    /** World pixels per millisecond — written to the Speed component. */
    moveSpeed: number;
    /** Subset of Stats that stays constant across levels. ATK / DEF /
     *  M.ATK / M.DEF are overwritten on every level-up via
     *  `applyCharacterRow`, so they're sourced from `statsByLevel`
     *  instead of this block. */
    base: Omit<Stats, 'atk' | 'def' | 'magicAtk' | 'magicDef'>;
  };
  /** Per-level stat row. Index 0 = level 1. The length defines the
   *  level cap. */
  statsByLevel: ReadonlyArray<CharacterLevelRow>;
  /** Cumulative XP needed to reach each level — same indexing as
   *  `statsByLevel`. xpToReachLevel[0] = 0 (already at level 1). */
  xpToReachLevel: ReadonlyArray<number>;
  /** Map of unlock level → addition slug. Slugs are intentionally
   *  loose strings (not the `AdditionKind` union) because future
   *  additions aren't declared in `ADDITIONS` yet. Consumers filter
   *  with `slug in ADDITIONS`. */
  additionUnlocksByLevel: ReadonlyMap<number, string>;
  /** Sprite-alias bundle. Loaded via AssetManager. Typed as the
   *  strict `AssetAlias` union so typos surface at compile time.
   *  `additions` maps per-addition slug → ordered list of frame
   *  aliases the RenderSystem swaps through during the cast
   *  animation. */
  sprite: {
    idle: AssetAlias;
    attack: AssetAlias;
    defend: AssetAlias;
    additions: Readonly<Record<string, ReadonlyArray<AssetAlias>>>;
  };
}

/** Lookup the stat row for `level`, clamping out-of-range. */
export function getCharacterStatsAtLevel(c: CharacterDef, level: number): CharacterLevelRow {
  const idx = Math.max(1, Math.min(c.statsByLevel.length, Math.round(level))) - 1;
  return c.statsByLevel[idx]!;
}

/** Cumulative XP needed to reach `level`. Clamps to cap when level
 *  exceeds the table — used by DeathSystem to set `xpToNext` after
 *  level-up. */
export function xpToReachLevel(c: CharacterDef, level: number): number {
  const idx = Math.max(1, Math.min(c.xpToReachLevel.length, Math.round(level))) - 1;
  return c.xpToReachLevel[idx]!;
}

/**
 * Write the character's row at `level` onto the player's `Stats` +
 * `Health` components. Mutates in place — caller passes the live
 * component references.
 *
 * `clampHpToMax` keeps the current HP at or below the new max (used
 * on save-load resume). When false, the caller is expected to refill
 * HP itself (level-up does a full heal via `current = max`).
 *
 * Action-RPG fields (atkSpeed, range, hit/avoid, SPEED scalar) live
 * in `actionStats.base` and are NOT touched here — they're written
 * once on spawn and never overwritten by level-ups.
 */
export function applyCharacterRow(
  stats: { atk: number; def: number; magicAtk: number; magicDef: number } | undefined,
  hp: { current: number; max: number } | undefined,
  character: CharacterDef,
  level: number,
  clampHpToMax: boolean,
): void {
  const row = getCharacterStatsAtLevel(character, level);
  if (stats) {
    stats.atk = row.atk;
    stats.def = row.def;
    stats.magicAtk = row.magicAtk;
    stats.magicDef = row.magicDef;
  }
  if (hp) {
    hp.max = row.hp;
    if (clampHpToMax) hp.current = Math.min(hp.current, hp.max);
  }
}
