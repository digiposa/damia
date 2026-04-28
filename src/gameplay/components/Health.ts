export interface Health {
  current: number;
  max: number;
  /** Timestamp (ms since page load) until which this entity ignores damage. Reserved for M5+. */
  invulnUntilMs: number;
}
