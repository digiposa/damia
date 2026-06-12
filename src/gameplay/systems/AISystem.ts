import type { Entity, System, World } from '@core/ecs';
import { worldToGrid } from '@core/math/iso';
import type { Components, Position } from '@gameplay/components';
import { spawnProjectile } from '@gameplay/entities/projectile';
import { effectiveAtk } from '@gameplay/stats';
import { SPELLS } from '@data/spells';

const FLEE_HP_THRESHOLD = 0.3;
const FLEE_DISTANCE_PX = 320;
const COCK_RETREAT_DISTANCE_PX = 200;
/** Cock starts retreating when its cooldown is more than this fraction of full. */
const COCK_RETREAT_COOLDOWN_RATIO = 0.5;
/** Knight of Sandora's Throw Dagger cooldown — long enough that the
 *  ranged ability stays a one-off rather than a spammable kite-counter. */
const KNIGHT_THROW_COOLDOWN_MS = 4000;
/** Visual swing duration for the throw — matches the 3-frame animation
 *  (~200 ms / frame, room for the projectile to leave the source). */
const KNIGHT_THROW_SWING_MS = 600;
/** Canon Throw Dagger multiplier (wiki: "0.5x Physical damage"). */
const KNIGHT_THROW_MULTIPLIER = 0.5;
/** Steel-gray dagger sprite tint so it reads distinct from Shana's
 *  brown arrow. Hex pinned in code for V1; promote to data when the
 *  ranged-mob roster grows past one. */
const KNIGHT_DAGGER_COLOR = 0xb0b8c4;
/** Commander Burn Out cast cooldown. Long enough that the cast stays
 *  a "boss tells" pressure move rather than dominating the duel —
 *  the player should always have time to close to melee + a swing or
 *  two between casts. */
const COMMANDER_SPELL_COOLDOWN_MS = 7000;
/** Range at which Commander becomes interested in casting. Past this
 *  he won't even try (the projectile-like Spell hits the locked target
 *  regardless of range in code, but gating it lets melee dominate at
 *  close range — option C of the trigger design). */
const COMMANDER_CAST_MAX_RANGE_PX = 320;
/** Minimum distance for the cast to fire even with cooldown ready —
 *  staying in melee is canonically supposed to read as "the brawl is
 *  going so well he doesn't bother with magic". */
const COMMANDER_CAST_MIN_RANGE_PX = 80;

interface SceneBounds {
  width: number;
  height: number;
}

/**
 * Per-mob behavior dispatcher. Each mob with an AI component is routed to a
 * handler that updates CombatIntent and Pathfinder accordingly.
 *
 * Behaviors:
 * - mouse  : aggros short-range, flees below 30% HP toward a cell opposite the player
 * - goblin : standard aggro at medium range, no special behavior
 * - cock   : aggros long-range, hit-and-run — retreats while cooldown is fresh
 * - trent  : standard aggro at short range (slow stats already differentiate it)
 */
export class AISystem implements System<Components> {
  constructor(private readonly bounds: SceneBounds) {}

  update(dt: number, world: World<Components>): void {
    const players = world.query(['Player', 'Position']);
    const playerId = players[0];
    if (playerId === undefined) return;
    const playerPos = world.getComponent(playerId, 'Position');
    if (!playerPos) return;

    for (const id of world.query(['AI', 'Position', 'Stats'])) {
      const ai = world.getComponent(id, 'AI');
      if (!ai) continue;
      // Tick per-mob ability cooldowns up-front. Behaviors that don't
      // use them never set them, so the field stays undefined and the
      // tick is a no-op.
      if (ai.throwCooldownMs !== undefined && ai.throwCooldownMs > 0) {
        ai.throwCooldownMs = Math.max(0, ai.throwCooldownMs - dt);
      }
      if (ai.spellCooldownMs !== undefined && ai.spellCooldownMs > 0) {
        ai.spellCooldownMs = Math.max(0, ai.spellCooldownMs - dt);
      }
      switch (ai.behavior) {
        case 'mouse':
          updateMouse(id, world, playerId, playerPos, this.bounds);
          break;
        case 'goblin':
        case 'trent':
          updateStandardMelee(id, world, playerId, playerPos);
          break;
        case 'cock':
          updateCock(id, world, playerId, playerPos, this.bounds);
          break;
        case 'knightOfSandora':
          updateKnightOfSandora(id, ai, world, playerId, playerPos);
          break;
        case 'commanderSeles':
          updateCommanderSeles(id, ai, world, playerId, playerPos);
          break;
      }
    }
  }
}

function updateMouse(
  id: Entity,
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
  bounds: SceneBounds,
): void {
  const pos = world.getComponent(id, 'Position');
  const hp = world.getComponent(id, 'Health');
  const stats = world.getComponent(id, 'Stats');
  const pf = world.getComponent(id, 'Pathfinder');
  if (!pos || !hp || !stats || !pf) return;

  const fleeing = hp.current / hp.max < FLEE_HP_THRESHOLD;
  if (fleeing) {
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    setFleeTarget(pf, pos, playerPos, FLEE_DISTANCE_PX, bounds);
    return;
  }

  const dist = distance(pos, playerPos);
  if (dist <= stats.aggroRange && !world.hasComponent(id, 'CombatIntent')) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

function updateStandardMelee(
  id: Entity,
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
): void {
  const pos = world.getComponent(id, 'Position');
  const stats = world.getComponent(id, 'Stats');
  if (!pos || !stats) return;
  if (world.hasComponent(id, 'CombatIntent')) return;
  if (distance(pos, playerPos) <= stats.aggroRange) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

function updateCock(
  id: Entity,
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
  bounds: SceneBounds,
): void {
  const pos = world.getComponent(id, 'Position');
  const stats = world.getComponent(id, 'Stats');
  const cd = world.getComponent(id, 'AttackCooldown');
  const pf = world.getComponent(id, 'Pathfinder');
  if (!pos || !stats || !cd || !pf) return;

  const dist = distance(pos, playerPos);
  if (dist > stats.aggroRange) return;

  const fullCooldown = 1000 / Math.max(0.1, stats.atkSpeed);
  const justAttacked = cd.remainingMs > fullCooldown * COCK_RETREAT_COOLDOWN_RATIO;

  if (justAttacked) {
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    setFleeTarget(pf, pos, playerPos, COCK_RETREAT_DISTANCE_PX, bounds);
  } else if (!world.hasComponent(id, 'CombatIntent')) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

function distance(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function setFleeTarget(
  pf: Components['Pathfinder'],
  selfPos: Position,
  fromPos: Position,
  distancePx: number,
  bounds: SceneBounds,
): void {
  const dx = selfPos.x - fromPos.x;
  const dy = selfPos.y - fromPos.y;
  const len = Math.hypot(dx, dy) || 1;
  const tx = selfPos.x + (dx / len) * distancePx;
  const ty = selfPos.y + (dy / len) * distancePx;
  const grid = worldToGrid(tx, ty);
  const gx = clamp(Math.round(grid.x), 0, bounds.width - 1);
  const gy = clamp(Math.round(grid.y), 0, bounds.height - 1);
  if (!pf.targetGrid || pf.targetGrid.gx !== gx || pf.targetGrid.gy !== gy) {
    pf.targetGrid = { gx, gy };
    pf.waypoints = null;
    pf.computing = false;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Knight of Sandora — standard melee chassis with a range-gated
 * secondary: when the player is OUT of melee reach but still within
 * aggro range AND the throw cooldown is ready, Knight chucks a dagger
 * for 0.5× physical damage and burns the cooldown. Otherwise standard
 * melee aggro (CombatIntent → CombatSystem swing). The throw fires the
 * projectile + plays the cosmetic AttackSwing(kind:'throw') in one
 * shot — there's no in-between "winding up" state because the swing
 * animation IS the wind-up.
 *
 * Range gating (vs canon PS1's random trigger) makes kiting still
 * pressure-y: you can't safely walk-circle the Knight, he'll punish
 * you with a dagger. In melee range he stays a regular sword fighter.
 */
function updateKnightOfSandora(
  id: Entity,
  ai: Components['AI'],
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
): void {
  const pos = world.getComponent(id, 'Position');
  const stats = world.getComponent(id, 'Stats');
  if (!pos || !stats) return;

  const dist = distance(pos, playerPos);
  // Standard aggro: outside aggro range → idle, don't chase.
  if (dist > stats.aggroRange) return;

  // Range-gated throw — only triggers when the player is OUT of melee
  // reach. Cooldown gates the spam. Also skip if a swing or addition
  // is already in flight (would visually collide).
  const inMeleeRange = dist <= stats.range;
  const throwReady = (ai.throwCooldownMs ?? 0) <= 0;
  const busy =
    world.hasComponent(id, 'AttackSwing') ||
    world.hasComponent(id, 'Addition') ||
    world.hasComponent(id, 'Dying');
  if (!inMeleeRange && throwReady && !busy) {
    fireKnightThrow(id, world, playerId, pos, playerPos);
    ai.throwCooldownMs = KNIGHT_THROW_COOLDOWN_MS;
    // Clear any pending melee intent so CombatSystem doesn't double-
    // up the swing on the same tick.
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    return;
  }

  // Default melee: chase + swing once in range (CombatSystem handles
  // the actual attack via the CombatIntent → AttackSwing path).
  if (!world.hasComponent(id, 'CombatIntent')) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

/** Spawn the dagger projectile + the cosmetic throw-animation swing.
 *  Damage = enemy physical formula × 0.5 (canon), resolved at hit time
 *  by ProjectileSystem using the snapshotted attackerAt. */
function fireKnightThrow(
  knightId: Entity,
  world: World<Components>,
  playerId: Entity,
  knightPos: Position,
  playerPos: Position,
): void {
  const dx = playerPos.x - knightPos.x;
  const dy = playerPos.y - knightPos.y;
  const len = Math.hypot(dx, dy) || 1;
  const dirX = dx / len;
  const dirY = dy / len;
  const attackerAt = effectiveAtk(world, knightId);
  spawnProjectile(world, {
    sourceId: knightId,
    sourceFaction: 'enemy',
    // Slight forward offset so the dagger doesn't visually overlap
    // the Knight on frame 1.
    x: knightPos.x + dirX * 24,
    y: knightPos.y + dirY * 24,
    dirX,
    dirY,
    attackerAt,
    attackerLv: 1,
    useEnemyFormula: true,
    damageMultiplier: KNIGHT_THROW_MULTIPLIER,
    spriteColor: KNIGHT_DAGGER_COLOR,
  });
  world.addComponent(knightId, 'AttackSwing', {
    elapsedMs: 0,
    totalMs: KNIGHT_THROW_SWING_MS,
    dirX,
    dirY,
    kind: 'throw',
  });
  void playerId; // unused but keeps the call site documenting the target
}

/**
 * Commander (Seles boss) — standard humanoid melee chassis with a
 * cooldown-gated + range-gated Burn Out cast layered on. Trigger
 * condition: cooldown ready AND target is between melee-edge and
 * spell-max range AND no Spell / AttackSwing / Dying already in
 * flight. Inside melee range he stays sword-focused, which reads
 * canonically as "the brawl is going so well he doesn't bother with
 * magic". Past spell-max he just chases.
 *
 * Cast pipeline reuses the existing player Spell component +
 * SpellSystem — the same Burn Out the player casts, so damage,
 * element, vfx, and the hit roll all go through the canonical
 * paths. No mob-specific damage code.
 */
function updateCommanderSeles(
  id: Entity,
  ai: Components['AI'],
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
): void {
  const pos = world.getComponent(id, 'Position');
  const stats = world.getComponent(id, 'Stats');
  if (!pos || !stats) return;

  const dist = distance(pos, playerPos);
  // Outside aggro range → idle.
  if (dist > stats.aggroRange) return;

  const busy =
    world.hasComponent(id, 'Spell') ||
    world.hasComponent(id, 'AttackSwing') ||
    world.hasComponent(id, 'Addition') ||
    world.hasComponent(id, 'Dying');
  const spellReady = (ai.spellCooldownMs ?? 0) <= 0;
  const inSpellWindow = dist > COMMANDER_CAST_MIN_RANGE_PX && dist <= COMMANDER_CAST_MAX_RANGE_PX;

  if (spellReady && inSpellWindow && !busy) {
    fireCommanderBurnOut(id, world, playerId, pos, playerPos);
    ai.spellCooldownMs = COMMANDER_SPELL_COOLDOWN_MS;
    // Drop any pending melee intent so CombatSystem doesn't queue a
    // swing on top of the cast.
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    // Freeze pathing for the cast duration — SpellSystem clears the
    // Spell at totalMs, after which the next AI tick resumes the
    // chase. Nulling Pathfinder.targetGrid keeps the Render walking
    // state in sync (no walk-cycle flicker mid-cast).
    const pf = world.getComponent(id, 'Pathfinder');
    if (pf) {
      pf.waypoints = null;
      pf.targetGrid = null;
    }
    return;
  }

  // Default: standard melee chase + swing.
  if (!world.hasComponent(id, 'CombatIntent')) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

/** Spawn a Spell component on the Commander targeting the player.
 *  Reads the canonical Burn Out definition so the same formula path
 *  the player uses (computeMagicalItemDamage via SpellSystem.hit)
 *  applies, including the element modifier (Fire vs Dart-Fire = ×0.5
 *  per canon). */
function fireCommanderBurnOut(
  commanderId: Entity,
  world: World<Components>,
  playerId: Entity,
  commanderPos: Position,
  playerPos: Position,
): void {
  const spell = SPELLS.burnOut;
  const dx = playerPos.x - commanderPos.x;
  const dy = playerPos.y - commanderPos.y;
  const len = Math.hypot(dx, dy) || 1;
  world.addComponent(commanderId, 'Spell', {
    kind: 'burnOut',
    elapsedMs: 0,
    totalMs: spell.totalMs,
    hitTimingMs: spell.hitTimingMs,
    hitApplied: false,
    bid: spell.bid,
    element: spell.element,
    target: 'lockedTarget',
    targetId: playerId,
    dirX: dx / len,
    dirY: dy / len,
    vfxKind: spell.vfx,
    vfxRadiusPx: spell.vfxRadiusPx ?? 60,
  });
}
