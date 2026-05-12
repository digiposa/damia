/**
 * Helper that bumps the player's `SpGauge.current` by `amount`,
 * clamped to `max`. Called from CombatSystem (auto-attack gain
 * for ranged) and AdditionSystem (addition-complete gain for
 * melee). Each archetype tunes its non-zero rate via
 * `archetype.dragoon.spGainPerAutoAttack` / `spGainPerAddition`,
 * so calling both hooks unconditionally is safe: the irrelevant
 * one fires with `amount=0` and the clamp leaves the gauge
 * untouched.
 *
 * No-op when the entity has no SpGauge or already at max — the
 * UI just shows a full gauge until the player triggers the
 * transformation.
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';

export function addSp(world: World<Components>, entityId: number, amount: number): void {
  if (amount <= 0) return;
  const sp = world.getComponent(entityId, 'SpGauge');
  if (!sp) return;
  if (sp.current >= sp.max) return;
  sp.current = Math.min(sp.max, sp.current + amount);
}
