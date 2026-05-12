/**
 * Shana — childhood friend of Dart, future White-Silver Dragoon.
 * Skeleton character (not yet exposed through any selector). The
 * structure is ready so a future Survival pre-run pick or a Story
 * party-swap can plug her in with zero engine change.
 *
 * Numbers are placeholders inspired by the TLoD design intent
 * (slower HP growth, lower physical stats, higher magic, ranged
 * bow attack) — they need replacing with the canonical TLoD table
 * from `shareAI/assetsTLOD/characters/Shana/stats.txt` once the
 * file is exported on the dev machine. The same applies to the XP
 * curve (TLoD has per-character curves) and the addition unlock
 * map (Shana in TLoD doesn't have Additions — she has Items + the
 * White-Silver Dragoon spells — so this map is intentionally
 * empty for now and will fill in once the spell system grows
 * character-specific entries).
 *
 * Sprite aliases resolve to Dart's textures via AssetManager
 * placeholders. Swap them when dedicated art ships.
 */
import type { CharacterDef, CharacterLevelRow } from './types';

// Placeholder per-level row. Same shape as Dart's table — 60 rows
// — but scaled to reflect Shana's role as a magic-leaning ranged
// support: ~75% HP, ~60% ATK/DEF, ~125% MAT/MDF compared to Dart.
// Numbers are SAFE for a v1 pass: no division-by-zero, no negative
// stat values, all monotonic with level. Replace once the canonical
// shareAI table is on hand.
function buildPlaceholderRow(level: number): CharacterLevelRow {
  const hp = Math.round(22 + (level - 1) * 18 + Math.max(0, level - 11) * 35);
  const atk = Math.round(1 + (level - 1) * 1.3);
  const def = Math.round(3 + (level - 1) * 1.4);
  const magicAtk = Math.round(4 + (level - 1) * 2.5);
  const magicDef = Math.round(5 + (level - 1) * 2.3);
  return { level, hp, atk, def, magicAtk, magicDef };
}

const SHANA_STATS_BY_LEVEL: ReadonlyArray<CharacterLevelRow> = Array.from(
  { length: 60 },
  (_unused, idx) => buildPlaceholderRow(idx + 1),
);

// Same cumulative XP curve as Dart for v1. Replace with Shana's
// dedicated column from xp.txt once available — TLoD curves vary
// per character (the higher-tier party members level slower).
const SHANA_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 22, 47, 110, 215, 372, 590, 882, 1255, 1722, 2290, 2974, 3784, 4730, 5817, 7056, 8459, 10037,
  11800, 13760, 15935, 18338, 20984, 23892, 27075, 30553, 34344, 38469, 42948, 47805, 53064, 58751,
  64892, 71511, 78635, 86291, 94507, 103312, 112735, 122804, 133547, 144994, 157172, 170112, 183838,
  198382, 213777, 230058, 247253, 265400, 284540, 304722, 325999, 348429, 372079, 397018, 423324,
  451082, 480379, 511313,
];

export const SHANA: CharacterDef = {
  id: 'shana',
  displayNameKey: 'character.shana.name',
  element: 'light',
  attackPattern: 'ranged',
  actionStats: {
    moveSpeed: 0.18,
    base: {
      speed: 50,
      // Slower bow draw vs Dart's sword swing. Tuned by feel later.
      atkSpeed: 1.0,
      // Bow range — roughly 3× Dart's melee 80 px so kiting feels
      // natural. CombatSystem's ranged branch (not yet implemented)
      // will read this for projectile spawn distance.
      range: 240,
      aggroRange: 0,
      attackHit: 95,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 5,
    },
  },
  statsByLevel: SHANA_STATS_BY_LEVEL,
  xpToReachLevel: SHANA_XP_TO_REACH_LEVEL,
  // Empty for v1 — Shana uses Items + White-Silver Dragoon spells in
  // TLoD, not the Additions melee combo system. The spell roster
  // will land via a future characterSpells map on CharacterDef once
  // SpellSystem grows character-aware unlock gates.
  additionUnlocksByLevel: new Map(),
  sprite: {
    idle: 'sprite.player.shana',
    attack: 'sprite.player.shana.attack',
    defend: 'sprite.player.shana.defend',
    // No additions for Shana — keep the map empty so spawnPlayer's
    // fallback (the attack texture) populates the placeholder.
    additions: {},
  },
};
