/**
 * Transient self-heal glow. Tagged on an entity for a short window when
 * it heals (Commander Seles' HP-recovers mechanic v1). Purely cosmetic:
 * RenderSystem paints a soft blue halo (the heal-number colour) behind
 * the sprite while present, pulsing once over `totalMs`. Unlike PowerUp
 * it does NOT freeze the entity — the boss keeps acting through the
 * glow. Ticked + removed by the owning AI handler.
 */
export interface HealGlow {
  elapsedMs: number;
  totalMs: number;
}
