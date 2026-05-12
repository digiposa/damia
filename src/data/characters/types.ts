/**
 * Character data model. Two layers:
 *
 *  - `DragoonArchetype`: the mechanical class (= TLoD's Dragoon
 *    Spirit holder). Owns stats per level, XP curve, action
 *    parameters (atkSpeed / range / hit / avoid), addition unlock
 *    schedule, dragoon-form configuration (timer, drain rate,
 *    stat multipliers, dragoon-form additions/spells). Shared by
 *    every avatar of the same archetype.
 *
 *  - `CharacterAvatar`: an individual playable face. Holds id,
 *    display name, sprite bundles (base + dragoon), a reference
 *    to its archetype, and the Survival unlock criterion. Lavitz
 *    and Albert are two avatars sharing the Jade Dragoon
 *    archetype; Shana and Miranda share White-Silver; etc.
 *
 * Story-mode transitions (Lavitz dies → Albert inherits) mutate
 * just the Character component's `avatar` field — same archetype
 * means identical stat scaling, additions, dragoon access, so
 * the player's progression carries over with zero data shuffling.
 */
import type { Stats } from '@gameplay/components';
import type { AssetAlias } from '@services/AssetManager';
import type { AdditionKind } from '@data/balance';

/** TLoD-style elemental affinity. */
export type CharacterElement =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'thunder'
  | 'light'
  | 'darkness'
  | 'divine';

/** Combat archetype. v1 reads `melee` only — `ranged` ships with
 *  the Projectile branch (already in place for Shana). */
export type AttackPattern = 'melee' | 'ranged';

/** The seven Dragoon Spirits of TLoD. Each binds an element + role
 *  pair (e.g. Fire + sword melee = Red-Eye Dragoon). */
export type ArchetypeId =
  | 'redEyeDragoon' // Dart (Fire)
  | 'jadeDragoon' // Lavitz / Albert / Graham / Syuveh (Wind)
  | 'whiteSilverDragoon' // Shana / Miranda / Shirley (Light)
  | 'darkBurstDragoon' // Rose (Darkness)
  | 'violetDragoon' // Haschel (Thunder)
  | 'blueSeaDragoon' // Meru / Damia (Water)
  | 'goldenDragoon'; // Kongol (Earth)

/** Individual playable face. Multiple avatars can share an
 *  archetype — TLoD's narrative substitutions (Lavitz → Albert,
 *  Shana → Miranda) ride this rail. */
export type AvatarId =
  | 'dart'
  | 'lavitz'
  | 'albert'
  | 'graham'
  | 'syuveh'
  | 'shana'
  | 'miranda'
  | 'shirley'
  | 'rose'
  | 'haschel'
  | 'meru'
  | 'damia'
  | 'kongol';

export interface CharacterLevelRow {
  level: number;
  hp: number;
  atk: number;
  def: number;
  magicAtk: number;
  magicDef: number;
}

/** Multipliers applied to base Stats while the avatar is
 *  transformed into Dragoon form. 1.0 = unchanged. */
export interface DragoonStatsMultiplier {
  atk: number;
  def: number;
  magicAtk: number;
  magicDef: number;
  hp: number;
  /** Movement speed multiplier (multiplies the Speed component's
   *  `value`). */
  moveSpeed: number;
}

/** Configuration for the timer-driven Dragoon transformation
 *  (Survival mode opt-in upgrade, Story narrative event). */
export interface DragoonConfig {
  /** Maximum transformation duration at the archetype's LV 1, ms.
   *  Scales with character level by `durationMsPerLevel`. */
  durationMsBase: number;
  /** ms added to the max duration per character level. */
  durationMsPerLevel: number;
  /** Extra ms drained from the timer when the avatar performs a
   *  dragoon-form action (regular attack, addition, spell). The
   *  timer also ticks down passively at 1× wall-clock. */
  drainPerActionMs: number;
  /** Multipliers applied to Stats / Health / Speed while in form. */
  statsMultiplier: DragoonStatsMultiplier;
  /** Dragoon-form addition / spell unlock schedule. Slugs filtered
   *  with `slug in ADDITIONS` at consume time. */
  additionUnlocksByLevel: ReadonlyMap<number, string>;
  /** SP a regular addition grants toward the transformation
   *  meter. Ranged archetypes without additions (White-Silver
   *  Dragoon) gain SP per auto-attack instead — encoded via
   *  `spGainPerAutoAttack`. */
  spGainPerAddition: number;
  /** SP gained per auto-attack hit. Non-zero for archetypes
   *  without an Addition combo (ranged). */
  spGainPerAutoAttack: number;
  /** Total SP needed to trigger the transformation. */
  spMax: number;
}

/**
 * Mechanical class. Shared by every avatar of the same archetype
 * — Lavitz and Albert read the same `statsByLevel`, the same
 * `additionUnlocksByLevel`, the same `dragoon` config. The
 * avatar only contributes id + sprite + lore.
 */
export interface DragoonArchetype {
  id: ArchetypeId;
  element: CharacterElement;
  attackPattern: AttackPattern;
  /** Action-RPG fields that don't scale per-level (movement
   *  speed + non-scaling subset of Stats). */
  actionStats: {
    /** World pixels per millisecond — written to the Speed
     *  component on spawn. */
    moveSpeed: number;
    /** Subset of Stats that stays constant across levels. ATK /
     *  DEF / M.ATK / M.DEF live in `statsByLevel`. */
    base: Omit<Stats, 'atk' | 'def' | 'magicAtk' | 'magicDef'>;
  };
  /** Canonical TLoD per-level row. Index 0 = LV 1; length = cap. */
  statsByLevel: ReadonlyArray<CharacterLevelRow>;
  /** Cumulative XP needed to reach each level — same indexing. */
  xpToReachLevel: ReadonlyArray<number>;
  /** Base-form addition unlock schedule, keyed by character level. The
   *  string values must match an `AdditionKind` slug — kept as
   *  `AdditionKind` so missing entries surface at compile time. */
  additionUnlocksByLevel: ReadonlyMap<number, AdditionKind>;
  /** Optional Master Addition. Canonically unlocks once every other
   *  addition on this archetype is mastered to Lv 5; the unlock check
   *  itself is deferred to a follow-up commit (this field just declares
   *  the slug so the picker can render it ahead of time). */
  masterAddition?: AdditionKind;
  /** Dragoon transformation config. Required — every TLoD party
   *  member has one. */
  dragoon: DragoonConfig;
}

/** Sprite bundle for one combat form (base or dragoon). */
export interface AvatarSpriteForm {
  idle: AssetAlias;
  attack: AssetAlias;
  defend: AssetAlias;
  /** Optional per-addition frame sequences (e.g. Dart's Double
   *  Slash second-hit frame). Slug → ordered alias list. Empty
   *  map falls back to the attack texture. */
  additions?: Readonly<Record<string, ReadonlyArray<AssetAlias>>>;
}

/** Optional Survival unlock criterion. Evaluated against a
 *  `SurvivalRunRecord` by `UnlockManager.evaluateUnlocks`. */
export interface UnlockCriterion {
  wave?: number;
  kills?: number;
  level?: number;
}

/**
 * Individual playable face. Multiple avatars per archetype is
 * the whole point of this layer — Shirley / Damia / Graham join
 * as Survival skins of the same mechanical class.
 */
export interface CharacterAvatar {
  id: AvatarId;
  displayNameKey: string;
  /** Direct archetype reference (not an id lookup) so consumers
   *  read `avatar.archetype.statsByLevel` with no indirection. */
  archetype: DragoonArchetype;
  sprite: {
    /** Base form sprite bundle. Used outside transformation. */
    base: AvatarSpriteForm;
    /** Dragoon form sprite bundle. Visually distinct per avatar
     *  (Lavitz Dragoon ≠ Albert Dragoon) even when the
     *  underlying spell pool is shared at the archetype level. */
    dragoon: AvatarSpriteForm;
  };
  /** Survival-only unlock criterion. Default-unlocked avatars
   *  (Dart) omit this field. */
  unlock?: UnlockCriterion;
  /** Optional i18n key for the "lore blurb" displayed on the
   *  selector card when this avatar is focused. */
  loreKey?: string;
}

// --- Lookup helpers -----------------------------------------------

export function getCharacterStatsAtLevel(
  archetype: DragoonArchetype,
  level: number,
): CharacterLevelRow {
  const idx = Math.max(1, Math.min(archetype.statsByLevel.length, Math.round(level))) - 1;
  return archetype.statsByLevel[idx]!;
}

export function xpToReachLevel(archetype: DragoonArchetype, level: number): number {
  const idx = Math.max(1, Math.min(archetype.xpToReachLevel.length, Math.round(level))) - 1;
  return archetype.xpToReachLevel[idx]!;
}

/**
 * Write the archetype's row at `level` onto the player's `Stats`
 * + `Health` components. Same semantics as the legacy
 * `applyDartRow` (signature kept stable for consumer migration —
 * the engine reads the archetype off `Character.avatar.archetype`).
 */
export function applyArchetypeRow(
  stats: { atk: number; def: number; magicAtk: number; magicDef: number } | undefined,
  hp: { current: number; max: number } | undefined,
  archetype: DragoonArchetype,
  level: number,
  clampHpToMax: boolean,
): void {
  const row = getCharacterStatsAtLevel(archetype, level);
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

// --- Back-compat aliases -----------------------------------------
// External consumers (scenes, components, services) still import
// these names. Keep the aliases so migration can happen in a
// follow-up sweep without breaking compile here.

/** @deprecated Use `CharacterAvatar`. */
export type CharacterDef = CharacterAvatar;

/** @deprecated Use `AvatarId`. */
export type CharacterId = AvatarId;

/** @deprecated Use `applyArchetypeRow` directly with the
 *  archetype from `avatar.archetype`. */
export function applyCharacterRow(
  stats: { atk: number; def: number; magicAtk: number; magicDef: number } | undefined,
  hp: { current: number; max: number } | undefined,
  avatar: CharacterAvatar,
  level: number,
  clampHpToMax: boolean,
): void {
  applyArchetypeRow(stats, hp, avatar.archetype, level, clampHpToMax);
}
