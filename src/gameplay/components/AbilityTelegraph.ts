/**
 * Mob ability telegraph — placed on a mob a brief window BEFORE it
 * unleashes a special move (Burn Out, Power Up, HP recovers). Drives:
 *
 *   - A floating "BURN OUT" label that pops above the mob's head at
 *     trigger time, colour-coded by ability, so the player reads the
 *     name even on a small mobile screen.
 *   - A mini cast bar painted above the mob (boss-only — gated by the
 *     `showCastBar` flag on the ability declaration) that fills as
 *     `elapsedMs / totalMs` so the player can time a dodge / interrupt.
 *
 * The component is purely a UX scaffold: AISystem ticks `elapsedMs` and
 * dispatches the underlying ability handler (`fireCommanderBurnOut`,
 * spawn `PowerUp`, apply heal) on completion, then removes the
 * component. For abilities that already have a built-in wind-up
 * component (Spell, PowerUp), AbilityTelegraph wraps that wind-up;
 * for genuinely instant abilities (HP recovers) it adds an artificial
 * delay so the cast bar has something to draw.
 */
export interface AbilityTelegraph {
  /** Ability slug — keyed into the per-ability config (label, colour,
   *  showCastBar) in `data/mobAbilities.ts`. */
  id: string;
  elapsedMs: number;
  totalMs: number;
}
