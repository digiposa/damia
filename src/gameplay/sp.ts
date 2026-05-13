/**
 * Helper that bumps the player's `SpGauge.current` by `amount`,
 * clamped to `max`. Called from CombatSystem (auto-attack gain
 * for ranged) and AdditionSystem (per-hit landed gain for melee).
 *
 * Gated by `Character.dragoonUnlocked` — VISION §6.5. While the
 * Dragoon form isn't unlocked for the avatar, every SP gain is a
 * silent no-op so the gauge stays empty (the canon TLoD behaviour:
 * Dart starts accumulating SP at Hoax, not before; Lavitz starts
 * after Graham; etc.). For Survival, the unlock arrives via the
 * LevelUpChoiceModal `dragoonUnlock` upgrade pick.
 *
 * Also no-op when the entity has no Character / no SpGauge or
 * the gauge is already at max.
 */
import type { World } from '@core/ecs';
import type { Components } from '@gameplay/components';

export function addSp(world: World<Components>, entityId: number, amount: number): void {
  if (amount <= 0) return;
  const character = world.getComponent(entityId, 'Character');
  if (!character?.dragoonUnlocked) return;
  const sp = world.getComponent(entityId, 'SpGauge');
  if (!sp) return;
  if (sp.current >= sp.max) return;
  sp.current = Math.min(sp.max, sp.current + amount);
}
