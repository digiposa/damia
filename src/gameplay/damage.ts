/**
 * Damage formulas — direct port of the TLoD PS1 canon (see "Necessary
 * Terms" doc shipped by the author). Three entry points for the three
 * sources of damage we have today; each computes the raw value via
 * the canon formula then funnels through a shared modifier wrapper
 * so future Fear / Power / Field / Element / Destroyer Mace systems
 * plug in cleanly.
 *
 * Player and enemy use different physical formulas:
 *   Player Archer Attack: round[AT × (LV + 5) × 5 / DF]
 *   Enemy  Physical:      floor[AT² × 5 / DF]
 * Additions and item magic each have their own shape on top.
 *
 * All ATK / DEF / MAT / MDF reads go through the `effective*` helpers
 * so the Dragoon multiplier (per VISION §6.2) is applied transparently
 * — `effectiveAtk` for a transformed Lavitz returns AT × archetype's
 * Dragoon AT mult, which is the rough analog of TLoD's DRGNAT% on the
 * Archer Attack and Addition formulas.
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { effectiveAtk, effectiveDef, effectiveMagicAtk, effectiveMagicDef } from '@gameplay/stats';

/** Minimum damage clamp. TLoD lets formulas produce 0 (extreme atk vs
 *  def ratios), but a "0 dmg" floating number reads as a broken hit
 *  in real-time. Floor at 1 for UX. */
const MIN_DAMAGE = 1;

/** Modifier set applied as the wrapper after the raw formula. Each
 *  field is a plain multiplier; defaults are identity (1) so present
 *  systems (only Defending → Guard 0.5×) plug in trivially and
 *  unimplemented modifiers stay no-op until their owning system
 *  (status effects, elements, equipment) ships. */
interface DamageModifiers {
  /** Target Fear status: 2× when active, 1 otherwise. */
  targetFear?: number;
  /** Attacker Fear status: 0.5× when active, 1 otherwise. */
  attackerFear?: number;
  /** Power items / Rose Storm chains. */
  power?: number;
  /** Field element match (special field × attack element). */
  field?: number;
  /** Target element match (target element × attack element). */
  element?: number;
  /** Defending = TLoD's Guard modifier: 0.5× when target Guarded last. */
  guard?: number;
  /** Haschel's Destroyer Mace HP-yellow / HP-red bonus (1.5× / 2×). */
  destroyerMace?: number;
}

function applyModifiers(raw: number, m: DamageModifiers): number {
  let dmg = raw;
  // The TLoD wrapper applies floors at each step; we keep the same
  // shape so the final value matches the canon to within 1.
  if (m.targetFear !== undefined && m.targetFear !== 1) dmg = Math.floor(dmg * m.targetFear);
  if (m.attackerFear !== undefined && m.attackerFear !== 1) dmg = Math.floor(dmg * m.attackerFear);
  if (m.power !== undefined && m.power !== 1) dmg = Math.floor(dmg * m.power);
  if (m.field !== undefined && m.field !== 1) dmg = Math.floor(dmg * m.field);
  if (m.element !== undefined && m.element !== 1) dmg = Math.floor(dmg * m.element);
  if (m.guard !== undefined && m.guard !== 1) dmg = Math.floor(dmg * m.guard);
  if (m.destroyerMace !== undefined && m.destroyerMace !== 1) {
    dmg = Math.floor(dmg * m.destroyerMace);
  }
  return Math.max(MIN_DAMAGE, dmg);
}

/** Read player level (LV) from Progression. Defaults to 1 for an
 *  attacker without a Progression component (mob, prop, ...). */
function levelOf(world: World<Components>, entityId: number): number {
  const prog = world.getComponent(entityId, 'Progression');
  return prog?.level ?? 1;
}

/** Build the modifier set from the world's live state. Today only
 *  Guard (= Defending) is implemented; the rest will plug in as the
 *  status / element / equipment systems land. */
function readModifiers(world: World<Components>, targetId: number): DamageModifiers {
  return {
    guard: world.hasComponent(targetId, 'Defending') ? 0.5 : 1,
  };
}

/** TLoD-style integer rounding helper: `(x + y/2) / y` for positive y.
 *  Matches the doc's `round{}` semantics and avoids JS Math.round's
 *  banker's-style edge cases for negative inputs (which we never see). */
function tlodRound(numerator: number, divisor: number): number {
  if (divisor <= 0) return numerator;
  return Math.floor((numerator + divisor / 2) / divisor);
}

/**
 * Player or enemy physical attack — the system picks the formula by
 * detecting whether the attacker has a Character component (player)
 * or not (mob).
 *
 *   Player: round[AT × (LV + 5) × 5 / DF]
 *   Enemy:  floor[AT² × 5 / DF]
 *
 * Both pass through the modifier wrapper at the end.
 */
export function computePhysicalDamage(
  world: World<Components>,
  attackerId: number,
  targetId: number,
): number {
  const atk = effectiveAtk(world, attackerId);
  const def = Math.max(1, effectiveDef(world, targetId));
  const isPlayer = world.hasComponent(attackerId, 'Character');
  let raw: number;
  if (isPlayer) {
    const lv = levelOf(world, attackerId);
    raw = tlodRound(atk * (lv + 5) * 5, def);
  } else {
    raw = Math.floor((atk * atk * 5) / def);
  }
  return applyModifiers(raw, readModifiers(world, targetId));
}

/**
 * Player Addition per-hit damage. Caller passes the per-hit value
 * (e.g. 75 for Harpoon hit 1, 25 for Harpoon hit 2) and the addition's
 * current per-level multiplier (TLoD canon, 100-based: 100 = 1×).
 *
 *   round[floor[floor[hitValue × Multiplier / 100] × AT / 100] × (LV + 5) × 5 / DF]
 *
 * Sum of per-hit results approximates the canonical "perfect addition"
 * damage to within 1 (floor truncation accumulates per hit) — close
 * enough, and worth it for the per-hit damage-number UX.
 */
export function computeAdditionDamage(
  world: World<Components>,
  attackerId: number,
  targetId: number,
  hitValue: number,
  multiplier: number,
): number {
  const atk = effectiveAtk(world, attackerId);
  const def = Math.max(1, effectiveDef(world, targetId));
  const lv = levelOf(world, attackerId);
  const additionFactor = Math.floor((hitValue * multiplier) / 100);
  const additionAtk = Math.floor((additionFactor * atk) / 100);
  const raw = tlodRound(additionAtk * (lv + 5) * 5, def);
  return applyModifiers(raw, readModifiers(world, targetId));
}

/**
 * Player Item Magic (Burn Out, Gushing Magma, …). `bid` is TLoD's
 * BID Data column — 100-based, e.g. 100 for "All Target Multi", 150
 * for "Single Target Multi", 300 for "All Target Powerful".
 *
 *   floor[(LV + 5) × MAT × 5 / MDF] × BID / 100
 *
 * Item Magic is player-only in TLoD and our codebase agrees.
 */
export function computeMagicalItemDamage(
  world: World<Components>,
  casterId: number,
  targetId: number,
  bid: number,
): number {
  const mat = effectiveMagicAtk(world, casterId);
  const mdf = Math.max(1, effectiveMagicDef(world, targetId));
  const lv = levelOf(world, casterId);
  const base = Math.floor(((lv + 5) * mat * 5) / mdf);
  const raw = Math.floor((base * bid) / 100);
  return applyModifiers(raw, readModifiers(world, targetId));
}
