import type { Entity, World } from '@core/ecs';
import { gridToWorld } from '@core/math/iso';
import type { AIBehavior, Components } from '@gameplay/components';
import { CHARACTER_SPRITE_DEFAULTS } from '@gameplay/components/Sprite';
import { BALANCE_SCALE, MOBS, type MobKind } from '@data/balance';
import { AssetManager, type AssetTag } from '@services/AssetManager';

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
  // Commander (Seles boss) — humanoid melee chassis + cooldown- and
  // range-gated Burn Out cast (per docs/features/bosses/Commander.md).
  // Power Up state-machine (Knights-down trigger → Slash Twice +
  // boost) + HP-recovers self-heal land in a follow-up; V1 wires the
  // standard melee + the magic cast.
  commanderSeles: 'commanderSeles',
  // Fruegel rides the humanoid melee AI for v1 — chase + swing on
  // contact. Boss-specific behaviour (charge, AoE smash, phase
  // transition) lands in a dedicated 'boss' branch later.
  fruegel: 'goblin',
};

/** Generic mob assembler. Looks up stats/sprite in `MOBS` and AI behavior in the table above. */
export function spawnMob(world: World<Components>, kind: MobKind, gx: number, gy: number): Entity {
  // Kick off the mob's tag load if it's not already resident. Non-
  // refcounting so dynamic spawns don't pin the tag across scene
  // boundaries — scenes that pre-declared the tag in `requiredTags`
  // own the lifecycle, this is just an idempotent fetch nudge for the
  // Training picker / debug / scripted-summon paths. The RenderSystem
  // auto-heal pass swaps the fallback shape for the real sprite the
  // moment the textures land.
  void AssetManager.prefetchCategory(`mob:${kind}` as AssetTag);
  const def = MOBS[kind];
  const { x, y } = gridToWorld(gx, gy);
  const id = world.createEntity();
  world.addComponent(id, 'Position', { x, y });
  world.addComponent(id, 'Speed', { value: def.speed });
  world.addComponent(id, 'Pathfinder', { targetGrid: null, waypoints: null, computing: false });
  // Canon JP HP scaled at spawn — see BALANCE_SCALE.mobHp. Keeping
  // the multiplier here (not on the def) means MOBS stays a direct
  // canon reference, and we tune by editing one constant.
  const scaledHp = Math.max(1, Math.round(def.health * BALANCE_SCALE.mobHp));
  world.addComponent(id, 'Health', { current: scaledHp, max: scaledHp });
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
