/**
 * Meru — TLoD's Blue-Sea Dragoon. Hammer-wielding melee with
 * high agility (fast atkSpeed, snappy movement) and a water /
 * wind magical leaning. Closer to Dart's combat envelope than
 * Shana (still melee) but with a different feel: shorter
 * windups, slightly squishier defence, marginally better magic.
 *
 * Numbers below are placeholders inspired by TLoD design intent
 * — replace with the canonical row from
 * `shareAI/assetsTLOD/characters/Meru/stats.txt` when on hand.
 * The XP curve also defaults to a placeholder slightly faster
 * than Dart's; swap once xp.txt's Meru column is extracted.
 *
 * Sprite is a single full-body pose reused for idle / attack /
 * defend until pose variants are generated.
 */
import type { CharacterDef, CharacterLevelRow } from './types';

function buildMeruRow(level: number): CharacterLevelRow {
  // Slightly less raw HP than Dart, marginally lower physical
  // attack/defence, marginally better magic. Soft mid-game ramp
  // around LV 11 to mirror Dart's "Dragoon awakening" inflection
  // — feels right narratively for the water dragoon too.
  const hp = Math.round(26 + (level - 1) * 22 + Math.max(0, level - 11) * 40);
  const atk = Math.round(2 + (level - 1) * 2.0);
  const def = Math.round(3 + (level - 1) * 1.7);
  const magicAtk = Math.round(4 + (level - 1) * 2.3);
  const magicDef = Math.round(4 + (level - 1) * 2.0);
  return { level, hp, atk, def, magicAtk, magicDef };
}

const MERU_STATS_BY_LEVEL: ReadonlyArray<CharacterLevelRow> = Array.from(
  { length: 60 },
  (_unused, idx) => buildMeruRow(idx + 1),
);

// Placeholder XP curve — slightly faster than Dart in the early
// game (Meru joins later in TLoD, lower per-level XP makes catch-up
// painless when she's introduced). Replace once xp.txt is on hand.
const MERU_XP_TO_REACH_LEVEL: ReadonlyArray<number> = [
  0, 18, 40, 95, 188, 326, 520, 779, 1108, 1521, 2022, 2625, 3340, 4179, 5142, 6237, 7475, 8870,
  10428, 12160, 14077, 16194, 18527, 21092, 23904, 26977, 30326, 33967, 37916, 42190, 46810, 51797,
  57175, 62971, 69219, 75955, 83218, 91047, 99489, 108593, 118415, 129017, 140462, 152822, 166167,
  180575, 196130, 212920, 231038, 250583, 271658, 294373, 318843, 345191, 373545, 404042, 436827,
  472051, 509878, 550482,
];

export const MERU: CharacterDef = {
  id: 'meru',
  displayNameKey: 'character.meru.name',
  element: 'water',
  attackPattern: 'melee',
  actionStats: {
    // Visibly faster than Dart's 0.18 — Meru's TLoD personality is
    // "energetic dancer", so a perceptible mobility edge sells her.
    moveSpeed: 0.21,
    base: {
      speed: 55,
      // Hammer pole gives her a touch more reach than Dart's sword.
      atkSpeed: 1.8,
      range: 96,
      aggroRange: 0,
      attackHit: 100,
      magicHit: 100,
      attackAvoid: 5,
      magicAvoid: 0,
    },
  },
  statsByLevel: MERU_STATS_BY_LEVEL,
  xpToReachLevel: MERU_XP_TO_REACH_LEVEL,
  // Meru's TLoD Additions: Double Smash, Hammer Spin, Cool Boogie,
  // Perky Step, Cat's Cradle, Diamond Dust. None declared in our
  // ADDITIONS yet — consumers filter by `slug in ADDITIONS`, so the
  // empty Map below means the AdditionsBar shows nothing for Meru
  // until at least one of these lands engine-side. (Dart's
  // doubleSlash is also gated by the same mechanism.)
  additionUnlocksByLevel: new Map([
    [1, 'doubleSmash'],
    [8, 'hammerSpin'],
    [15, 'coolBoogie'],
    [22, 'perkyStep'],
    [29, 'catsCradle'],
    [36, 'diamondDust'],
  ]),
  sprite: {
    idle: 'sprite.player.meru',
    attack: 'sprite.player.meru.attack',
    defend: 'sprite.player.meru.defend',
    additions: {},
  },
};
