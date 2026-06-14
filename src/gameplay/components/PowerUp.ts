/**
 * Boss transformation overlay. Tagged on a mob (Commander Seles v1)
 * while it's playing its Power Up pose — `totalMs` window of
 * dramatic stance + flame aura, no movement, no attacks, no spells.
 * Picked up by RenderSystem (priority just below Dying), which splits
 * the window across `Sprite.powerUpFrames` (multi-frame) or holds
 * `Sprite.powerUpTextureAlias` (single-pose fallback). AISystem
 * ticks `elapsedMs`; on completion it removes the component and
 * latches `AI.poweredUp` to true so CombatSystem swaps to Slash
 * Twice + 2× physical, and Burn Out scales × 1.5.
 *
 * Single-use: the AI handler only spawns the component once per
 * encounter (gated by `AI.poweredUp` itself), so destroying + adding
 * a fresh one would mean "Power Up again" which the boss never does.
 */
export interface PowerUp {
  elapsedMs: number;
  totalMs: number;
}
