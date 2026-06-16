/**
 * Telegraph + label config for mob special abilities. Centralises the
 * UX side (label text, colour, cast-bar visibility, wind-up duration)
 * so adding a new boss ability is a single entry here + a one-line
 * AISystem hook (`stageTelegraph(id, world, mob, 'burnOut')`).
 *
 *   labelKey       — i18n key for the floating label spawned at
 *                    trigger time (e.g. `ability.commander.burnOut` →
 *                    "BURN OUT" / "BRÛLURE").
 *   color          — both the floating label colour and the cast-bar
 *                    fill colour. Match the ability's element / mood
 *                    (fire = orange-red, heal = heal-number blue,
 *                    transform = crimson).
 *   showCastBar    — boss-only marker: paints the mini bar above the
 *                    mob during the telegraph. Trash mobs only get
 *                    the label pop.
 *   windUpMs       — telegraph window in ms. For abilities whose own
 *                    component already has a wind-up baked in (Spell,
 *                    PowerUp) this should match that wind-up — the
 *                    cast bar then runs in lockstep with the real
 *                    move. For instant abilities (HP recovers) this
 *                    is a synthetic delay added purely for legibility.
 */
export interface AbilityConfig {
  labelKey: string;
  color: number;
  showCastBar: boolean;
  windUpMs: number;
}

export type MobAbilityId = 'burnOut' | 'powerUp' | 'healRecovers' | 'throwDagger';

export const MOB_ABILITIES: Record<MobAbilityId, AbilityConfig> = {
  burnOut: {
    labelKey: 'ability.commander.burnOut',
    color: 0xff6a2a, // fire orange
    showCastBar: true,
    // Matches SPELLS.burnOut.hitTimingMs so the bar fills exactly until
    // the spell's impact tick.
    windUpMs: 600,
  },
  powerUp: {
    labelKey: 'ability.commander.powerUp',
    color: 0xd02828, // transform crimson
    showCastBar: true,
    // Matches the PowerUp component window in AISystem (its full
    // freeze duration) so the bar drains over the whole transformation.
    windUpMs: 900,
  },
  healRecovers: {
    labelKey: 'ability.commander.heal',
    color: 0x80e0ff, // heal-number blue
    showCastBar: true,
    // Synthetic delay — the heal is canonically instant; the bar gives
    // the player a beat to see the move coming so they can burst the
    // boss to cancel via lethal damage if they're close enough.
    windUpMs: 500,
  },
  throwDagger: {
    labelKey: 'ability.knight.throwDagger',
    color: 0xb0b8c4, // steel grey (matches the dagger tint)
    // Knights aren't bosses — label only, no cast bar.
    showCastBar: false,
    // Matches KNIGHT_THROW_SWING_MS in AISystem.
    windUpMs: 600,
  },
};
