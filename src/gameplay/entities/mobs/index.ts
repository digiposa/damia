import type { Entity, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { AIBehavior, Components } from '@gameplay/components';
import { CHARACTER_SPRITE_DEFAULTS } from '@gameplay/components/Sprite';
import { MOBS, type MobKind } from '@data/balance';

const KIND_TO_BEHAVIOR: Record<MobKind, AIBehavior> = {
  berserkMouse: 'mouse',
  goblin: 'goblin',
  assassinCock: 'cock',
  trent: 'trent',
  // Knight of Sandora — standard humanoid melee + range-gated Throw
  // Dagger secondary (0.5× physical projectile when out of reach).
  // Both narrative variants (Seles + Kazas Black Castle) share the
  // behaviour; stats differ but the AI logic doesn't.
  knightOfSandoraSeles: 'knightOfSandora',
  knightOfSandoraKazas: 'knightOfSandora',
  // Commander (Seles) — V1 ships with the standard humanoid melee
  // chassis. The canon Power Up state machine + HP-recovers + Burn
  // Out cast pattern (see docs/features/bosses/Commander.md) lands
  // in a dedicated 'commander' behaviour later.
  commanderSeles: 'goblin',
  // Fruegel rides the humanoid melee AI for v1 — chase + swing on
  // contact. Boss-specific behaviour (charge, AoE smash, phase
  // transition) lands in a dedicated 'boss' branch later.
  fruegel: 'goblin',
};

/** Generic mob assembler. Looks up stats/sprite in `MOBS` and AI behavior in the table above. */
export function spawnMob(world: World<Components>, kind: MobKind, gx: number, gy: number): Entity {
  const def = MOBS[kind];
  const { x, y } = gridToWorld(gx, gy);
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x, y });
  world.addComponent(id, 'Speed', { value: def.speed });
  world.addComponent(id, 'Pathfinder', { targetGrid: null, waypoints: null, computing: false });
  world.addComponent(id, 'Health', { current: def.health, max: def.health });
  world.addComponent(id, 'Stats', { ...def.stats });
  world.addComponent(id, 'Faction', { side: 'enemy' });
  world.addComponent(id, 'AttackCooldown', { remainingMs: 0 });
  // Defaults first so a mob whose source art faces right (or is purely
  // symmetric) can opt out of the mirror via `mirrorOnFacingRight: false`
  // directly in its MobDefinition.sprite spec.
  world.addComponent(id, 'Sprite', { ...CHARACTER_SPRITE_DEFAULTS, ...def.sprite });
  world.addComponent(id, 'AI', { behavior: KIND_TO_BEHAVIOR[kind] });
  // Element affinity drives the Element modifier in damage.ts. Every
  // mob has one per TLoD canon; defaults are baked into MOBS. The
  // optional `physicalElement` override flips the mob's physical
  // attack to be elementally tagged — canon-default is Non-Elemental.
  world.addComponent(id, 'Affinity', {
    value: def.element,
    ...(def.physicalElement ? { physicalAttack: def.physicalElement } : {}),
  });
  return id;
}
