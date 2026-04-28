import { describe, expect, it } from 'vitest';
import { COMBAT, computeDamage } from '@data/balance';

describe('computeDamage', () => {
  it('applies atk - def with zero variance at roll=0.5', () => {
    expect(computeDamage(12, 3, 0.5, false)).toBe(9);
  });

  it('respects the minimum damage floor', () => {
    expect(computeDamage(2, 50, 0.5, false)).toBe(COMBAT.minDamage);
    expect(computeDamage(2, 50, 0, false)).toBe(COMBAT.minDamage);
  });

  it('halves damage when target is defending', () => {
    // base damage at roll=0.5: 20-4 = 16; defending → 8
    expect(computeDamage(20, 4, 0.5, true)).toBe(8);
  });

  it('roll spans the full variance range', () => {
    // atk=10, def=0, variance=2 (default). Min at roll=0 → 10 - 2 = 8. Max at roll≈1 → 10 + 2 = 12.
    expect(computeDamage(10, 0, 0, false)).toBe(8);
    expect(computeDamage(10, 0, 1 - 1e-9, false)).toBe(12);
  });
});
