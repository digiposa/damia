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
import type { Element } from '@data/elements';
import { elementModifier } from '@data/elements';
import { EQUIPMENT, type EquipmentDefinition, type EquipmentSlug } from '@data/equipment';
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

/** Defensive element of a target entity. Reads the `Affinity` component
 *  populated at spawn (player from archetype, mob from MobDefinition).
 *  Falls back to Non-Elemental for entities with no Affinity yet (props,
 *  legacy spawns) — the modifier helper treats NE as neutral. */
function targetElementOf(world: World<Components>, entityId: number): Element {
  return world.getComponent(entityId, 'Affinity')?.value ?? 'non-elemental';
}

/** Resolve the element of an attacker's physical / addition attack:
 *   - Dragoon form → archetype's element (Heat Blade-style infusion is
 *     overridden in canon by the Dragoon's own element while
 *     transformed)
 *   - Base form → equipped weapon's element if it has one, else
 *     Non-Elemental (Broad Sword, Spear, plain Iron Knuckle, etc.)
 *   - Mob attacker → its own Affinity (mob physical is always its
 *     element per canon)
 * Used by `computePhysicalDamage` + `computeAdditionTotalDamage`. Item
 * magic doesn't go through here — the caller passes the spell element
 * explicitly to `computeMagicalItemDamage`. */
function physicalAttackElement(world: World<Components>, attackerId: number): Element {
  const character = world.getComponent(attackerId, 'Character');
  if (!character) {
    // Mob (or any non-Character entity) — attack element = self.
    return targetElementOf(world, attackerId);
  }
  if (world.hasComponent(attackerId, 'Dragoon')) {
    return character.avatar.archetype.element;
  }
  // Base form — read the equipped weapon's element. We don't have a
  // runtime Loadout component yet (TODO), so we walk the spawn-time
  // `startingEquipment` slug list and pick the first weapon-slot item.
  // EQUIPMENT is `as const satisfies Record<…, EquipmentDefinition>`,
  // which narrows literal shapes — cast back to the interface so we
  // can read the optional `element` uniformly (same pattern as
  // `totalEquipmentBonuses` in data/equipment.ts).
  const startingEquipment = character.avatar.startingEquipment ?? [];
  for (const slug of startingEquipment as readonly EquipmentSlug[]) {
    const def: EquipmentDefinition = EQUIPMENT[slug];
    if (def.slot === 'weapon') return def.element ?? 'non-elemental';
  }
  return 'non-elemental';
}

/** Build the modifier set from the world's live state. Today only
 *  Guard (= Defending) and Element (target vs attack element) are
 *  implemented; the rest will plug in as the status / equipment /
 *  Special Battle Command systems land. */
function readModifiers(
  world: World<Components>,
  targetId: number,
  attackElement: Element,
): DamageModifiers {
  const targetElement = targetElementOf(world, targetId);
  return {
    element: elementModifier(attackElement, targetElement),
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
  const attackElement = physicalAttackElement(world, attackerId);
  return applyModifiers(raw, readModifiers(world, targetId, attackElement));
}

/**
 * Canonical TLoD Addition damage — full formula on the SUM of hit values,
 * not per-hit (the previous per-hit version accumulated up to N floor
 * truncations vs the canonical 1, drifting the total).
 *
 *   round[floor[floor[Σhits × Multiplier / 100] × AT / 100] × (LV + 5) × 5 / DF]
 *
 * Caller supplies the sum of the addition's per-hit values and the level
 * multiplier (100-based: 100 = 1×, 202 = 2.02× …). For the floating
 * damage-number-per-hit UX, feed this total to `distributeAdditionDamage`
 * along with the per-hit hit values to get a length-N array whose sum
 * matches the canon exactly.
 */
export function computeAdditionTotalDamage(
  world: World<Components>,
  attackerId: number,
  targetId: number,
  sumHitValues: number,
  multiplier: number,
): number {
  const atk = effectiveAtk(world, attackerId);
  const def = Math.max(1, effectiveDef(world, targetId));
  const lv = levelOf(world, attackerId);
  const additionFactor = Math.floor((sumHitValues * multiplier) / 100);
  const additionAtk = Math.floor((additionFactor * atk) / 100);
  const raw = tlodRound(additionAtk * (lv + 5) * 5, def);
  const attackElement = physicalAttackElement(world, attackerId);
  return applyModifiers(raw, readModifiers(world, targetId, attackElement));
}

/**
 * Split a canonical addition total across its hits proportionally to each
 * hit's relative weight in the addition's `hits` array. Integer truncation
 * remainders pile onto the LAST hit so Σ(result) === total exactly — the
 * player still gets a satisfying per-hit floating damage number, but the
 * combined damage matches the canon to the unit.
 *
 *   hit[i] dmg = floor(total × hitValues[i] / Σ hitValues),  i in [0, N-2]
 *   hit[N-1]   = total − Σ(previous hits)
 *
 * Returns an array the same length as `hitValues`. If all hit weights are
 * zero (or the array is empty) the result is a same-length array of zeros.
 */
export function distributeAdditionDamage(total: number, hitValues: readonly number[]): number[] {
  const n = hitValues.length;
  if (n === 0) return [];
  const sum = hitValues.reduce((acc, v) => acc + v, 0);
  if (sum <= 0) return new Array<number>(n).fill(0);
  const result = new Array<number>(n);
  let assigned = 0;
  for (let i = 0; i < n - 1; i++) {
    const share = Math.floor((total * (hitValues[i] ?? 0)) / sum);
    result[i] = share;
    assigned += share;
  }
  // Last hit absorbs the rounding remainder so Σ matches `total` exactly.
  result[n - 1] = Math.max(0, total - assigned);
  return result;
}

/**
 * Player Item Magic (Burn Out, Gushing Magma, …). `bid` is TLoD's
 * BID Data column — 100-based, e.g. 100 for "All Target Multi", 150
 * for "Single Target Multi", 300 for "All Target Powerful".
 *
 *   floor[(LV + 5) × MAT × 5 / MDF] × BID / 100
 *
 * `attackElement` is the spell's element (`SpellDefinition.element`)
 * — the caller passes it explicitly because the same caster can cast
 * spells of different elements over time. Falls back to Non-Elemental
 * when omitted so legacy call sites keep working until they're updated.
 *
 * Item Magic is player-only in TLoD and our codebase agrees.
 */
export function computeMagicalItemDamage(
  world: World<Components>,
  casterId: number,
  targetId: number,
  bid: number,
  attackElement: Element = 'non-elemental',
): number {
  const mat = effectiveMagicAtk(world, casterId);
  const mdf = Math.max(1, effectiveMagicDef(world, targetId));
  const lv = levelOf(world, casterId);
  const base = Math.floor(((lv + 5) * mat * 5) / mdf);
  const raw = Math.floor((base * bid) / 100);
  return applyModifiers(raw, readModifiers(world, targetId, attackElement));
}
