/** Decremented by CooldownSystem each frame. While > 0, the entity cannot attack. */
export interface AttackCooldown {
  remainingMs: number;
}
