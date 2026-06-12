export type AIBehavior =
  | 'mouse'
  | 'goblin'
  | 'cock'
  | 'trent'
  | 'knightOfSandora'
  | 'commanderSeles';

/** Tells AISystem which per-mob handler to dispatch. State is derived
 *  from other components, with one exception: per-mob ability cooldowns
 *  live on AI when they're tied to a behavior-specific ability (rather
 *  than the universal `AttackCooldown`). Knight of Sandora's Throw
 *  Dagger ticks `throwCooldownMs` here so the regular melee swing
 *  cooldown isn't polluted. */
export interface AI {
  behavior: AIBehavior;
  /** Throw-ability cooldown in ms. Ticked down by AISystem on every
   *  update; 0 (or undefined) → ready. Set by behaviors that own a
   *  ranged secondary; ignored by behaviors that don't. */
  throwCooldownMs?: number;
  /** Spell-cast cooldown in ms. Same pattern as throwCooldownMs —
   *  ticked down by AISystem, behaviours that own a cast ability
   *  (Commander → Burn Out) check it before firing. 0 / undefined =
   *  ready. */
  spellCooldownMs?: number;
}
