import { describe, expect, it } from 'vitest';
import { World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import { ARCHETYPES, DART } from '@data/characters';
const JADE_DRAGOON = ARCHETYPES.jadeDragoon;
import {
  computeAdditionDamage,
  computeMagicalItemDamage,
  computePhysicalDamage,
} from '@gameplay/damage';

/** Minimal entity factories. We attach only the components the
 *  damage helpers actually read — keeps the setup tight. */
function makePlayer(world: World<Components>, level: number, atk: number, def: number): number {
  const id = world.createEntity();
  world.addComponent(id, 'Player', {});
  world.addComponent(id, 'Character', { avatar: DART, dragoonUnlocked: false });
  world.addComponent(id, 'Stats', {
    atk,
    def,
    magicAtk: 10,
    magicDef: 10,
    speed: 50,
    atkSpeed: 1.5,
    range: 80,
    aggroRange: 0,
    attackHit: 100,
    magicHit: 100,
    attackAvoid: 0,
    magicAvoid: 0,
  });
  world.addComponent(id, 'Speed', { value: 0.18 });
  world.addComponent(id, 'Progression', { level, xp: 0, xpToNext: 999, additionUses: {} });
  return id;
}

function makeEnemy(world: World<Components>, atk: number, def: number): number {
  const id = world.createEntity();
  world.addComponent(id, 'Stats', {
    atk,
    def,
    magicAtk: 0,
    magicDef: 1,
    speed: 50,
    atkSpeed: 1,
    range: 60,
    aggroRange: 200,
    attackHit: 100,
    magicHit: 100,
    attackAvoid: 0,
    magicAvoid: 0,
  });
  return id;
}

describe('computePhysicalDamage', () => {
  it('player: round[AT × (LV+5) × 5 / DF]', () => {
    // Lavitz LV5 (atk 16) vs Fruegel (def 100):
    // round[16 × 10 × 5 / 100] = round[8] = 8.
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    // Re-attach Lavitz's archetype — Character is set to DART by the
    // helper but we want JADE_DRAGOON for canonical Lavitz numbers.
    const c = w.getComponent(player, 'Character');
    if (c) c.avatar = { ...c.avatar, archetype: JADE_DRAGOON };
    const fruegel = makeEnemy(w, 6, 100);
    expect(computePhysicalDamage(w, player, fruegel)).toBe(8);
  });

  it('enemy: floor[AT² × 5 / DF]', () => {
    // Goblin atk 8 vs Lavitz LV5 def 16:
    // floor[64 × 5 / 16] = floor[20] = 20.
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const goblin = makeEnemy(w, 8, 1);
    expect(computePhysicalDamage(w, goblin, player)).toBe(20);
  });

  it('Guard halves the result via the modifier wrapper', () => {
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const fruegel = makeEnemy(w, 6, 100);
    w.addComponent(fruegel, 'Defending', { elapsedMs: 0, totalMs: 3000 });
    // Base 8 → halved to 4.
    expect(computePhysicalDamage(w, player, fruegel)).toBe(4);
  });

  it('floor at 1 even when the formula produces 0', () => {
    const w = new World<Components>();
    const player = makePlayer(w, 1, 1, 1);
    const wall = makeEnemy(w, 0, 9999);
    // Player vs huge def = 0 raw → clamped to 1.
    expect(computePhysicalDamage(w, player, wall)).toBe(1);
  });
});

describe('computeAdditionDamage', () => {
  it('per-hit canon formula', () => {
    // Lavitz LV5 (atk 16) vs Fruegel (def 100), Harpoon hit 1
    // (hitValue 75) at multiplier 100 (LV1 mastery):
    // floor[75 × 100 / 100] = 75
    // floor[75 × 16 / 100] = 12
    // round[12 × 10 × 5 / 100] = round[6] = 6.
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const fruegel = makeEnemy(w, 6, 100);
    expect(computeAdditionDamage(w, player, fruegel, 75, 100)).toBe(6);
  });

  it('high multiplier × small hitValue still produces real damage', () => {
    // hitValue 30, multiplier 234 (Cat's Cradle LV5):
    // floor[30 × 234 / 100] = 70 → floor[70 × 16 / 100] = 11
    // tlodRound(11 × 10 × 5, 100) = floor((550 + 50) / 100) = 6.
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const fruegel = makeEnemy(w, 6, 100);
    expect(computeAdditionDamage(w, player, fruegel, 30, 234)).toBe(6);
  });
});

describe('computeMagicalItemDamage', () => {
  it('player Item Magic: floor[(LV+5) × MAT × 5 / MDF] × BID / 100', () => {
    // Player LV5, MAT 10, vs target MDF 1, BID 150 (single-target multi):
    // floor[10 × 10 × 5 / 1] = 500
    // floor[500 × 150 / 100] = 750.
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const goblin = makeEnemy(w, 8, 1);
    expect(computeMagicalItemDamage(w, player, goblin, 150)).toBe(750);
  });

  it('Guard halves item magic too', () => {
    const w = new World<Components>();
    const player = makePlayer(w, 5, 16, 16);
    const goblin = makeEnemy(w, 8, 1);
    w.addComponent(goblin, 'Defending', { elapsedMs: 0, totalMs: 3000 });
    expect(computeMagicalItemDamage(w, player, goblin, 150)).toBe(375);
  });
});
