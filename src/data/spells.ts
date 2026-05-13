/**
 * Magical attack items (TLoD calls them "Magical Attack Items"). They live in
 * the inventory like consumables — casting one decrements the count by 1 — but
 * mechanically they're spells: SpellSystem ticks the animation and applies
 * damage scaled by the caster's `magicAtk`.
 *
 * Targeting modes:
 *  - `'lockedTarget'` — fires at the entity in the player's `CombatIntent`
 *    (fallback: nearest enemy in range). Single-target.
 *  - `'groundAoE'` — UI enters a ground-target mode (cursor circle on the
 *    ground). On click, AoE around the click point. Range capped per spell.
 */
import type { VfxKind } from '@gameplay/components/Vfx';

export type SpellKind = 'burnOut' | 'gushingMagma';

export type SpellElement = 'fire' | 'water' | 'thunder' | 'earth' | 'wind' | 'light' | 'dark';

interface SpellBase {
  /** Display name (i18n later). */
  name: string;
  /** Total animation duration in ms. Movement/attack frozen during this window. */
  totalMs: number;
  /** Time (ms from start) at which damage is applied. */
  hitTimingMs: number;
  /** TLoD-canon Item Magic BID (Base In-Damage), 100-based. Plugged into
   *  the formula `floor[(LV+5) × MAT × 5 / MDF] × BID / 100`. Reference
   *  values from the doc: Detonate Rock 100, All-Target Multi 100,
   *  Single-Target Multi 150, All-Target Powerful 300, Psyche Bomb X 400. */
  bid: number;
  /** Element tag (no multiplier yet — preserved for the future resistance system). */
  element: SpellElement;
  /** Cooldown after cast, in ms. 0 = no cooldown (only the item count gates). */
  cooldownMs: number;
  /** Visual effect kind spawned at the hit location (or AoE center) on impact. */
  vfx: VfxKind;
  /** Hit-effect end-radius hint, in world px. Defaults to a sane per-target value
   *  in SpellSystem when not provided here. */
  vfxRadiusPx?: number;
}

export interface SpellSingleTarget extends SpellBase {
  target: 'lockedTarget';
  /** Range in world px. Cast cancels with toast "no target" if no enemy in range. */
  rangePx: number;
}

export interface SpellGroundAoE extends SpellBase {
  target: 'groundAoE';
  /** Max distance (world px) the player can target from their position. */
  castRangePx: number;
  /** Damage radius around the click point. */
  aoeRadiusPx: number;
}

export type SpellDefinition = SpellSingleTarget | SpellGroundAoE;

export const SPELLS: Record<SpellKind, SpellDefinition> = {
  burnOut: {
    name: 'Burn Out',
    totalMs: 600,
    hitTimingMs: 350,
    // Single-target multi item — TLoD canonical BID 150.
    bid: 150,
    element: 'fire',
    cooldownMs: 0,
    target: 'lockedTarget',
    rangePx: 320,
    vfx: 'fireImpact',
    vfxRadiusPx: 60,
  },
  gushingMagma: {
    name: 'Gushing Magma',
    totalMs: 900,
    hitTimingMs: 550,
    // All-target multi item — TLoD canonical BID 100.
    bid: 100,
    element: 'fire',
    cooldownMs: 0,
    target: 'groundAoE',
    castRangePx: 480,
    aoeRadiusPx: 160,
    // 4-pillar pattern — see VfxSystem.animateMagmaPillars. The radius
    // is each pillar's flame height; the overall footprint is fixed by
    // MAGMA_PILLAR_OFFSETS in VfxSystem.
    vfx: 'magmaPillars',
    vfxRadiusPx: 120,
  },
};
