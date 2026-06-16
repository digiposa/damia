import type { Entity, System, World } from '@core/ecs';
import { worldToGrid } from '@core/math/iso';
import type { Components, Position } from '@gameplay/components';
import { spawnProjectile } from '@gameplay/entities/projectile';
import { FLOAT_HEAL_HP, spawnFloatingText } from '@gameplay/entities/floatingText';
import { effectiveAtk } from '@gameplay/stats';
import { SPELLS } from '@data/spells';
import { pace } from '@data/balance';
import { MOB_ABILITIES, type MobAbilityId } from '@data/mobAbilities';
import { playSfx } from '@services/AudioManager';
import { t } from '@services/I18nService';

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
/** Commander HP fraction below which the Power Up self-buff fires.
 *  Single-use trigger per encounter — gated by `AI.poweredUp`. Canon
 *  trigger is "Knights of Sandora defeated"; v1 uses HP threshold so
 *  the mechanic is observable in Training and any solo-Commander
 *  spawn. Wire the Knights-down predicate alongside once the scripted
 *  Seles formation lands. */
const COMMANDER_POWER_UP_HP_TRIGGER = 0.6;
/** Power Up transformation window. Boss freezes pathing for this many
 *  ms while RenderSystem splits the duration across `powerUpFrames`
 *  (2 frames v1 = 450 ms each — long enough that each pose reads as
 *  a deliberate beat rather than a flash). On expiry the component is
 *  dropped and `AI.poweredUp = true` latches. */
const COMMANDER_POWER_UP_MS = 900;
/** Multiplier applied to Burn Out's base damage after Power Up. Canon
 *  TLoD bumps the Fire-elemental spell from 1.2× to 1.5×; baseline
 *  here is 1.0 (we haven't shipped the pre-PU 1.2× yet — flip both
 *  numbers if we want strict canon, but 1.0 → 1.5 keeps the visible
 *  delta sharp at our action-RPG scale). */
const COMMANDER_BURN_OUT_POWERED_MULT = 1.5;
/** HP recovers self-heal — canon boss mechanic: auto + single-use,
 *  triggers below this HP fraction and restores COMMANDER_HEAL_FRAC of
 *  max HP. Sits just under the Power Up threshold (0.6) so a falling
 *  health bar fires Power Up first, then the heal a beat later. */
const COMMANDER_HEAL_HP_TRIGGER = 0.51;
/** Fraction of max HP restored by HP recovers (canon: 30%). On the
 *  ×10-scaled Commander (150 max) that's +45. */
const COMMANDER_HEAL_FRAC = 0.3;
/** Duration of the cosmetic blue heal aura. */
const COMMANDER_HEAL_GLOW_MS = 700;

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
          updateCommanderSeles(id, ai, world, playerId, playerPos, dt);
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
    stageAbilityTelegraph(world, id, 'throwDagger', pos);
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
    totalMs: pace(KNIGHT_THROW_SWING_MS),
    dirX,
    dirY,
    kind: 'throw',
  });
  void playerId; // unused but keeps the call site documenting the target
}

/**
 * Commander (Seles boss). Standard humanoid melee chassis (chase + swing
 * via CombatIntent → CombatSystem) with a range- and cooldown-gated Burn
 * Out cast layered on. Two pieces of state-machine flavour:
 *
 *   - Power Up (single-use, HP < 60%): spawns a `PowerUp` component
 *     that freezes pathing for a brief transformation window. On
 *     completion `AI.poweredUp` latches true for the rest of the
 *     encounter.
 *
 *   - Post Power Up effects ride existing systems:
 *       * Basic attacks become Slash Twice — CombatSystem reads
 *         `AI.poweredUp`, tags the AttackSwing with `kind: 'slashTwice'`
 *         (RenderSystem picks the Slash Twice frames), and applies the
 *         canon 2× physical damage multiplier.
 *       * Burn Out's base intelligence damage scales × 1.5.
 *
 * v1 deliberately uses HP < 60% in place of the canonical "Knights of
 * Sandora defeated" trigger because the scripted Seles formation isn't
 * wired yet. Add the Knights-down predicate alongside HP once it lands.
 */
function updateCommanderSeles(
  id: Entity,
  ai: Components['AI'],
  world: World<Components>,
  playerId: Entity,
  playerPos: Position,
  dt: number,
): void {
  const pos = world.getComponent(id, 'Position');
  const stats = world.getComponent(id, 'Stats');
  const hp = world.getComponent(id, 'Health');
  if (!pos || !stats || !hp) return;

  // Tick the cosmetic heal aura (doesn't gate any behaviour — the boss
  // keeps acting through it). Removed when its window elapses.
  const healGlow = world.getComponent(id, 'HealGlow');
  if (healGlow) {
    healGlow.elapsedMs += dt;
    if (healGlow.elapsedMs >= healGlow.totalMs) world.removeComponent(id, 'HealGlow');
  }

  // --- Ability telegraph window ---------------------------------------
  // Two roles. For abilities whose gameplay component (Spell, PowerUp)
  // already owns its wind-up, the telegraph is overlay-only — it ticks
  // alongside the gameplay component, drives the cast-bar, and is
  // removed on expiry without dispatching anything (the gameplay
  // component handles the impact on its own). For the genuinely instant
  // `healRecovers` ability, the telegraph IS the gate: it freezes the
  // boss during the synthetic wind-up, then applies the heal + visual
  // pop on expiry.
  const telegraph = world.getComponent(id, 'AbilityTelegraph');
  if (telegraph) {
    telegraph.elapsedMs += dt;
    const expired = telegraph.elapsedMs >= telegraph.totalMs;
    if (expired) {
      if (telegraph.id === 'healRecovers') {
        const healAmount = Math.round(hp.max * COMMANDER_HEAL_FRAC);
        hp.current = Math.min(hp.max, hp.current + healAmount);
        ai.healedOnce = true;
        spawnFloatingText(world, {
          x: pos.x,
          y: pos.y,
          text: `+${healAmount}`,
          color: FLOAT_HEAL_HP,
        });
        world.addComponent(id, 'HealGlow', { elapsedMs: 0, totalMs: COMMANDER_HEAL_GLOW_MS });
        playSfx('items.pickup');
      }
      world.removeComponent(id, 'AbilityTelegraph');
    }
    // healRecovers has no parallel gameplay component, so the telegraph
    // is the only thing freezing the boss. Hold pathing + skip the rest
    // of the handler until it expires.
    if (telegraph.id === 'healRecovers' && !expired) {
      if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
      const pf = world.getComponent(id, 'Pathfinder');
      if (pf) {
        pf.waypoints = null;
        pf.targetGrid = null;
      }
      return;
    }
  }

  // --- PowerUp visual window -------------------------------------------
  // While the transformation plays the boss stops everything — no
  // chase, no swing, no cast. CombatIntent is dropped so CombatSystem
  // skips the entity for the duration, and the Pathfinder is nulled so
  // the walking pose doesn't bleed through the static aura sprite.
  const powerUp = world.getComponent(id, 'PowerUp');
  if (powerUp) {
    powerUp.elapsedMs += dt;
    const pf = world.getComponent(id, 'Pathfinder');
    if (pf) {
      pf.waypoints = null;
      pf.targetGrid = null;
    }
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    if (powerUp.elapsedMs >= powerUp.totalMs) {
      world.removeComponent(id, 'PowerUp');
      ai.poweredUp = true;
    }
    return;
  }

  if (world.hasComponent(id, 'Dying')) return;

  const dist = distance(pos, playerPos);
  if (dist > stats.aggroRange) return;

  const busy =
    world.hasComponent(id, 'Spell') ||
    world.hasComponent(id, 'AttackSwing') ||
    world.hasComponent(id, 'Addition') ||
    world.hasComponent(id, 'AbilityTelegraph');

  // --- Power Up trigger (single-use, HP threshold) ---------------------
  // The `!busy` guard prevents the transformation from interrupting a
  // swing or a Burn Out mid-flight — it fires the moment the boss is
  // between actions and the threshold is crossed.
  if (!ai.poweredUp && !busy && hp.current / hp.max < COMMANDER_POWER_UP_HP_TRIGGER) {
    world.addComponent(id, 'PowerUp', {
      elapsedMs: 0,
      totalMs: COMMANDER_POWER_UP_MS,
    });
    stageAbilityTelegraph(world, id, 'powerUp', pos);
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    return;
  }

  // --- HP recovers self-heal (single-use, HP < 51%) -------------------
  // The actual heal + glow are applied when the telegraph window
  // expires (see the telegraph tick at the top of the handler). This
  // gives the player a short reactive beat to see the move coming.
  if (!ai.healedOnce && !busy && hp.current / hp.max < COMMANDER_HEAL_HP_TRIGGER) {
    stageAbilityTelegraph(world, id, 'healRecovers', pos);
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    return;
  }

  const spellReady = (ai.spellCooldownMs ?? 0) <= 0;
  const inSpellWindow = dist > COMMANDER_CAST_MIN_RANGE_PX && dist <= COMMANDER_CAST_MAX_RANGE_PX;

  // --- Burn Out cast (1.0× pre-PU, 1.5× post-PU) -----------------------
  if (spellReady && inSpellWindow && !busy) {
    fireCommanderBurnOut(id, world, playerId, pos, playerPos, ai.poweredUp ?? false);
    stageAbilityTelegraph(world, id, 'burnOut', pos);
    ai.spellCooldownMs = COMMANDER_SPELL_COOLDOWN_MS;
    if (world.hasComponent(id, 'CombatIntent')) world.removeComponent(id, 'CombatIntent');
    const pf = world.getComponent(id, 'Pathfinder');
    if (pf) {
      pf.waypoints = null;
      pf.targetGrid = null;
    }
    return;
  }

  // --- Default melee chase + swing via CombatSystem --------------------
  // Same hand-off pre and post Power Up. CombatSystem reads
  // `AI.poweredUp` to swap the swing's kind / damage; AISystem only
  // decides whether to engage.
  if (!world.hasComponent(id, 'CombatIntent')) {
    world.addComponent(id, 'CombatIntent', { targetId: playerId });
  }
}

/** Spawn a Spell component on the Commander targeting the player.
 *  Reads the canonical Burn Out definition so the same formula path
 *  the player uses (computeMagicalItemDamage via SpellSystem.hit)
 *  applies, including the element modifier (Fire vs Dart-Fire = ×0.5
 *  per canon). `poweredUp` scales the spell's base intelligence
 *  damage by COMMANDER_BURN_OUT_POWERED_MULT — canon TLoD bumps
 *  the multiplier after Power Up. */
function fireCommanderBurnOut(
  commanderId: Entity,
  world: World<Components>,
  playerId: Entity,
  commanderPos: Position,
  playerPos: Position,
  poweredUp: boolean,
): void {
  const spell = SPELLS.burnOut;
  const dx = playerPos.x - commanderPos.x;
  const dy = playerPos.y - commanderPos.y;
  const len = Math.hypot(dx, dy) || 1;
  const bid = poweredUp ? Math.round(spell.bid * COMMANDER_BURN_OUT_POWERED_MULT) : spell.bid;
  world.addComponent(commanderId, 'Spell', {
    kind: 'burnOut',
    elapsedMs: 0,
    totalMs: pace(spell.totalMs),
    hitTimingMs: pace(spell.hitTimingMs),
    hitApplied: false,
    bid,
    element: spell.element,
    target: 'lockedTarget',
    targetId: playerId,
    dirX: dx / len,
    dirY: dy / len,
    vfxKind: spell.vfx,
    vfxRadiusPx: spell.vfxRadiusPx ?? 60,
  });
}

/** Stage a mob ability telegraph: add the AbilityTelegraph component
 *  (which drives the cast bar painted by EntityHudSystem) and pop the
 *  ability's i18n label as a coloured floating text above the mob.
 *  Caller is responsible for spawning the underlying gameplay component
 *  (Spell, PowerUp, AttackSwing…) alongside; the telegraph is overlay
 *  only — except for `healRecovers`, where the telegraph itself gates
 *  the dispatch (see the tick loop at the top of updateCommanderSeles). */
function stageAbilityTelegraph(
  world: World<Components>,
  id: Entity,
  abilityId: MobAbilityId,
  pos: Position,
): void {
  const config = MOB_ABILITIES[abilityId];
  // Telegraphs over a COMBAT_PACE-scaled action (cast / swing) are paced
  // in lockstep so the cast bar finishes with the move; fixed-window
  // telegraphs (PowerUp / heal freezes) keep their raw duration.
  const totalMs = config.scalesWithPace ? pace(config.windUpMs) : config.windUpMs;
  world.addComponent(id, 'AbilityTelegraph', {
    id: abilityId,
    elapsedMs: 0,
    totalMs,
  });
  // Label pops above the mob's head and rises — gives the player a
  // reactive read on the move BEFORE its impact frame.
  spawnFloatingText(world, {
    x: pos.x,
    y: pos.y - 80,
    text: t(config.labelKey),
    color: config.color,
  });
}
