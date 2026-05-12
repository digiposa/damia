/**
 * Procedural helpers for character data. Used by archetypes that
 * don't yet have their canonical TLoD `stats.txt` row plugged in
 * (Dark Burst, Violet, Golden as of writing). When the canonical
 * row arrives, replace the `placeholderStatsByLevel(...)` call in
 * the archetype with a literal `ReadonlyArray<CharacterLevelRow>`
 * and drop the import.
 */
import type { CharacterLevelRow } from './types';

/** Profile knobs that tune the generated stat curve. */
export interface PlaceholderProfile {
  baseHp: number;
  hpPerLevel: number;
  /** Extra HP per level past LV 11 — mirrors Dart's TLoD inflection
   *  where Dragoon transformation kicks the HP curve into higher
   *  gear. Set to 0 for a flat curve. */
  hpMidGameBonus: number;
  baseAtk: number;
  atkPerLevel: number;
  baseDef: number;
  defPerLevel: number;
  baseMagicAtk: number;
  magicAtkPerLevel: number;
  baseMagicDef: number;
  magicDefPerLevel: number;
}

/** Generate a 60-row placeholder stat table from a profile. */
export function placeholderStatsByLevel(p: PlaceholderProfile): ReadonlyArray<CharacterLevelRow> {
  return Array.from({ length: 60 }, (_unused, idx) => {
    const level = idx + 1;
    return {
      level,
      hp: Math.round(
        p.baseHp + (level - 1) * p.hpPerLevel + Math.max(0, level - 11) * p.hpMidGameBonus,
      ),
      atk: Math.round(p.baseAtk + (level - 1) * p.atkPerLevel),
      def: Math.round(p.baseDef + (level - 1) * p.defPerLevel),
      magicAtk: Math.round(p.baseMagicAtk + (level - 1) * p.magicAtkPerLevel),
      magicDef: Math.round(p.baseMagicDef + (level - 1) * p.magicDefPerLevel),
    };
  });
}
