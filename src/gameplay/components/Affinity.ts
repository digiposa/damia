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
  value: Element;
}
