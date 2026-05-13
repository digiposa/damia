import type { SpellKind } from '@data/spells';
import type { VfxKind } from './Vfx';

/**
 * Active spell-cast in flight. Mutually exclusive with Addition / regular swing
 * (CombatSystem and AdditionSystem skip entities that have a Spell). SpellSystem
 * advances `elapsedMs` and applies damage when crossing `hitTimingMs`, then
 * removes the component.
 *
 * Two target shapes are baked in so SpellSystem doesn't need to read SPELLS
 * mid-cast — the ECS data is self-contained:
 *  - locked-target: fires at `targetId` (single entity).
 *  - ground-AoE: damages every enemy within `aoeRadiusPx` of (targetX, targetY).
 */
export interface Spell {
  kind: SpellKind;
  elapsedMs: number;
  totalMs: number;
  hitTimingMs: number;
  /** True once the hit checkpoint has been crossed (idempotency on slow frames). */
  hitApplied: boolean;
  /** TLoD-canon Item Magic BID (100-based) — see `data/spells.ts`. The
   *  damage formula `floor[(LV+5) × MAT × 5 / MDF] × BID / 100` runs
   *  inside `gameplay/damage.ts → computeMagicalItemDamage`. */
  bid: number;
  /** Discriminator. Determines which of the targetXxx fields below is meaningful. */
  target: 'lockedTarget' | 'groundAoE';
  /** lockedTarget only — entity to hit. Validated at apply time (Dying/dead → no-op). */
  targetId?: number;
  /** groundAoE only — world-space center of the AoE. */
  targetX?: number;
  targetY?: number;
  /** groundAoE only — damage radius in world px. */
  aoeRadiusPx?: number;
  /** Unit vector from caster to target/click — used by RenderSystem for facing. */
  dirX: number;
  dirY: number;
  /** Visual effect spawned at impact (per-target for lockedTarget, at center for AoE). */
  vfxKind: VfxKind;
  /** End-radius hint for the impact VFX. */
  vfxRadiusPx: number;
}
