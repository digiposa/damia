import type { SpellElement } from './spells';

/**
 * Hex RGB tint applied to the unified magic spell icon to communicate
 * the spell's element at a glance. Slot painters read this map and pass
 * it through Pixi's `Sprite.tint` (multiplicative). Picked from the
 * TLoD canon element palette — warm fire, cool water, etc.
 *
 * Why one icon + tint (vs one PNG per element / target combo): scales
 * to any new element without an art pass, keeps the spell family
 * visually coherent (same silhouette = "this is magic"), lets the
 * element colour double as a quick legibility cue ("incoming red
 * glow = fire spell, dodge"). The base PNG is authored on the cool
 * side, so cold-family tints (water / wind) keep more of the source
 * detail than hot-family tints (fire) — acceptable trade-off versus
 * shipping 14 hand-painted icons.
 */
export const ELEMENT_COLOR: Readonly<Record<SpellElement, number>> = {
  fire: 0xff5530,
  water: 0x55aaff,
  thunder: 0xcc55ff,
  earth: 0xaacc66,
  wind: 0x88eecc,
  light: 0xffeeaa,
  dark: 0x884488,
};
