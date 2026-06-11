import type { Element } from '@data/elements';

/**
 * Defensive elemental affinity — the entity's "own" element, used by
 * `damage.ts` to compute the Element modifier against an incoming
 * attack (×1.5 if the attack is the opposite element, ×0.5 if same
 * — except Non-Elemental which doesn't self-resist, ×1 otherwise).
 *
 * Spawned on every combatant: players read it from their
 * `Character.avatar.archetype.element`, mobs from
 * `MOBS[kind].element`. Stored as a dedicated component (not a Stats
 * field) because Stats is the numeric combat block and conflating the
 * two scrambles the mental model when reading damage.ts.
 *
 * The component name "Affinity" disambiguates from the DOM `Element`
 * type and from the `Element` string union — same concept, but the
 * world-attached carrier needs its own name to stay greppable.
 */
export interface Affinity {
  /** Defensive element — drives the Element modifier when this entity
   *  is the target of an incoming attack. Required. */
  value: Element;
  /** Override for the element this entity's physical attacks carry.
   *  Optional; when undefined the canon defaults apply:
   *    - mob physical → Non-Elemental
   *    - player physical → weapon element (or Non-Elemental)
   *    - player Dragoon physical → archetype element
   *  Set on the rare mobs whose canon spec calls out an elemental
   *  physical (e.g. a fire elemental whose bite IS Fire, distinct from
   *  the default neutral mob swing). The damage helper falls back to
   *  the canon default when this is absent. */
  physicalAttack?: Element;
}
