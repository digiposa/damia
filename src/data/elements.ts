/**
 * TLoD elemental system — single source of truth for the 8 canon
 * elements, opposite pairs, and the damage multiplier helpers used by
 * the wrapper in `gameplay/damage.ts`.
 *
 * Canon (see `docs/features/combat/elements.md`):
 *   - 8 elements total; Thunder + Non-Elemental have NO opposite.
 *   - Element modifier (target's element vs the attack's element):
 *       opposite → ×1.5
 *       same     → ×0.5  (except Non-Elemental which doesn't self-resist)
 *       neither  → ×1
 *   - Field modifier (attack vs current Element Field, bidirectional —
 *     friend OR foe matching the field gets the bonus). Same numbers as
 *     Element but mirrored intent. The Special Battle Command sets the
 *     field; we don't ship it yet (single-player real-time, no Special),
 *     so `fieldModifier` exists for shape-completeness but consumers
 *     leave the field undefined → returns ×1.
 *
 * Replaces the older `SpellElement` ('dark') and `CharacterElement`
 * ('divine') types — both are now this one type. The fandom 'dark' →
 * canon 'darkness'; the design-mistake 'divine' (Divine Dragon is an
 * NON-Elemental enemy, not its own element) → canon 'non-elemental'.
 */
export type Element =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'light'
  | 'darkness'
  | 'thunder'
  | 'non-elemental';

/** Element pair lookup. Thunder + Non-Elemental are absent — they
 *  have no canonical opposite (cf. wiki LoD). */
const OPPOSITES: Partial<Record<Element, Element>> = {
  fire: 'water',
  water: 'fire',
  wind: 'earth',
  earth: 'wind',
  light: 'darkness',
  darkness: 'light',
};

/** Returns the canonical opposite of `elem`, or `null` if it has none
 *  (Thunder + Non-Elemental). Convenience around the OPPOSITES map for
 *  callers that don't want to import it. */
export function oppositeElement(elem: Element): Element | null {
  return OPPOSITES[elem] ?? null;
}

/**
 * Damage multiplier from the target's element resisting / being weak to
 * the attack's element. Plugs straight into the modifier wrapper's
 * `element` slot in `gameplay/damage.ts`.
 *
 *   elementModifier('fire', 'water')      → 1.5  (water target weak to fire)
 *   elementModifier('fire', 'fire')       → 0.5  (fire target resists fire)
 *   elementModifier('non-elemental', 'non-elemental') → 1 (NE self-no-resist)
 *   elementModifier('thunder', 'thunder') → 0.5  (Thunder DOES self-resist)
 *   elementModifier('fire', 'earth')      → 1    (neither match nor opposite)
 */
export function elementModifier(attackElem: Element, targetElem: Element): number {
  if (OPPOSITES[attackElem] === targetElem) return 1.5;
  if (attackElem === targetElem && attackElem !== 'non-elemental') return 0.5;
  return 1;
}

/**
 * Field modifier — independent of Element. Same numbers but driven by
 * an environmental Field set by a Dragoon's Special Battle Command:
 * matching the field BOOSTS the attack ×1.5 (offensive, bidirectional),
 * opposite SHRINKS it ×0.5. Pass `undefined` when no field is active
 * (default in V1 — Special isn't wired yet).
 */
export function fieldModifier(attackElem: Element, fieldElem?: Element): number {
  if (!fieldElem) return 1;
  if (OPPOSITES[attackElem] === fieldElem) return 0.5;
  if (attackElem === fieldElem && attackElem !== 'non-elemental') return 1.5;
  return 1;
}

/** Hex tints for the 8 elements. Used by the magic-icon painter to
 *  colour spells at a glance + by the codex / character selector
 *  borders. Values mirror the previous `data/elementColors.ts` map,
 *  with `darkness` replacing the old `dark` key and a fresh
 *  `non-elemental` entry (neutral grey for Non-Elemental). */
export const ELEMENT_COLOR: Readonly<Record<Element, number>> = {
  fire: 0xff5530,
  water: 0x55aaff,
  wind: 0x88eecc,
  earth: 0xaacc66,
  light: 0xffeeaa,
  darkness: 0x884488,
  thunder: 0xcc55ff,
  'non-elemental': 0x888888,
};
