/**
 * Boss transformation overlay. Tagged on a mob (Commander Seles v1)
 * while it's playing its Power Up pose — `totalMs` window of
 * dramatic stance + flame aura, no movement, no attacks, no spells.
 * Picked up by RenderSystem (priority just below Dying) to swap to
 * `Sprite.powerUpTextureAlias`. AISystem ticks `elapsedMs`; on
 * completion it removes the component, flips `AI.poweredUp` to true,
 * and queues the canonical "Slash Twice immediately" follow-up.
 *
 * Single-use: the AI handler only spawns the component once per
 * encounter (gated by `AI.poweredUp` itself), so destroying + adding
 * a fresh one would mean "Power Up again" which the boss never does.
 */
export interface PowerUp {
  elapsedMs: number;
  totalMs: number;
}
