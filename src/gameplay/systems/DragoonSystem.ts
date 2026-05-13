import type { System, World } from '@core/ecs';
import type { Components } from '@gameplay/components';
import type { DragoonArchetype } from '@data/characters';
import { FLOAT_HEAL, spawnFloatingText } from '@gameplay/entities/floatingText';
import { playSfx } from '@services/AudioManager';

/**
 * Drives the live Dragoon transformation. Each frame:
 *
 *   1. For every entity with a `Dragoon` component, drain `timerMs`
 *      by the wall-clock `dt` (passive drain). Action-driven drain
 *      is added by the callers that spawn the dragoon-form Action
 *      (AdditionSystem / SpellSystem hook points — wired when
 *      dragoon spells land).
 *   2. When `timerMs <= 0`, restore the pre-transform Stats / Speed
 *      / Health.max snapshots, swap the Sprite aliases back to
 *      `avatar.sprite.base.*`, fire a small "form ends" cue (toast
 *      + sfx), and remove the Dragoon component.
 *
 * Transform START is NOT this system's job — the scene's transform
 * button calls `enterDragoonForm` directly so SP drain + sprite
 * swap happen on the same frame the player tapped (responsive feel).
 */
export class DragoonSystem implements System<Components> {
  update(dt: number, world: World<Components>): void {
    for (const id of world.query(['Dragoon'])) {
      const d = world.getComponent(id, 'Dragoon');
      if (!d) continue;
      d.timerMs -= dt;
      if (d.timerMs > 0) continue;
      // Timer expired — restore base state.
      exitDragoonForm(world, id);
    }
  }
}

/**
 * Engage Dragoon form on the given entity (player only in v1).
 * Snapshots the pre-transform Stats / Speed / Health.max so the
 * exit path restores them verbatim. Applies the archetype's stat
 * multipliers, swaps Sprite aliases to the avatar's dragoon
 * bundle, and adds the `Dragoon` component carrying the timer.
 *
 * No-op if the entity has no Character (mob doesn't transform),
 * no SpGauge (gauge required), or is already transformed.
 * Drains SP to 0 on success.
 */
export function enterDragoonForm(world: World<Components>, entityId: number): boolean {
  if (world.hasComponent(entityId, 'Dragoon')) return false;
  const character = world.getComponent(entityId, 'Character');
  const sp = world.getComponent(entityId, 'SpGauge');
  if (!character || !sp) return false;
  if (sp.current < sp.max) return false;
  const stats = world.getComponent(entityId, 'Stats');
  const speed = world.getComponent(entityId, 'Speed');
  const sprite = world.getComponent(entityId, 'Sprite');
  if (!stats || !speed || !sprite) return false;

  const archetype: DragoonArchetype = character.avatar.archetype;
  const mult = archetype.dragoon.statsMultiplier;
  // Snapshot before mutation so the exit path can restore exactly.
  // Health.max is not snapshotted — see Dragoon component JSDoc.
  const preAtk = stats.atk;
  const preDef = stats.def;
  const preMagicAtk = stats.magicAtk;
  const preMagicDef = stats.magicDef;
  const preMoveSpeed = speed.value;

  stats.atk = Math.round(preAtk * mult.atk);
  stats.def = Math.round(preDef * mult.def);
  stats.magicAtk = Math.round(preMagicAtk * mult.magicAtk);
  stats.magicDef = Math.round(preMagicDef * mult.magicDef);
  speed.value = preMoveSpeed * mult.moveSpeed;

  // Swap sprite aliases to the avatar's dragoon-form bundle.
  // RenderSystem reads these each frame, so the texture changes on
  // the next paint.
  sprite.textureAlias = character.avatar.sprite.dragoon.idle;
  sprite.attackTextureAlias = character.avatar.sprite.dragoon.attack;
  sprite.defendTextureAlias = character.avatar.sprite.dragoon.defend;

  const totalDuration = computeMaxTimerMs(character.avatar.archetype, entityId, world);
  world.addComponent(entityId, 'Dragoon', {
    timerMs: totalDuration,
    maxTimerMs: totalDuration,
    preAtk,
    preDef,
    preMagicAtk,
    preMagicDef,
    preMoveSpeed,
  });
  sp.current = 0;

  // Visual + audio cue. A dedicated dragoon-transform SFX comes
  // with the asset pass; until then the pickup chime stands in.
  playSfx('items.pickup');
  const pos = world.getComponent(entityId, 'Position');
  if (pos) {
    spawnFloatingText(world, {
      x: pos.x,
      y: pos.y - 30,
      text: 'DRAGOON!',
      color: FLOAT_HEAL,
      durationMs: 1500,
    });
  }
  return true;
}

/**
 * End the Dragoon form. Reverts every snapshotted value to its
 * pre-transform state, restores the base sprite aliases, removes
 * the `Dragoon` component. Safe to call when the component is
 * absent (no-op).
 */
export function exitDragoonForm(world: World<Components>, entityId: number): void {
  const d = world.getComponent(entityId, 'Dragoon');
  if (!d) return;
  const character = world.getComponent(entityId, 'Character');
  const stats = world.getComponent(entityId, 'Stats');
  const speed = world.getComponent(entityId, 'Speed');
  const sprite = world.getComponent(entityId, 'Sprite');

  if (stats) {
    stats.atk = d.preAtk;
    stats.def = d.preDef;
    stats.magicAtk = d.preMagicAtk;
    stats.magicDef = d.preMagicDef;
  }
  if (speed) speed.value = d.preMoveSpeed;
  if (sprite && character) {
    sprite.textureAlias = character.avatar.sprite.base.idle;
    sprite.attackTextureAlias = character.avatar.sprite.base.attack;
    sprite.defendTextureAlias = character.avatar.sprite.base.defend;
  }
  world.removeComponent(entityId, 'Dragoon');
}

/** Compute the transformation's max duration in ms — base value
 *  plus a per-character-level bonus from the archetype's config. */
function computeMaxTimerMs(
  archetype: DragoonArchetype,
  entityId: number,
  world: World<Components>,
): number {
  const prog = world.getComponent(entityId, 'Progression');
  const level = prog?.level ?? 1;
  return archetype.dragoon.durationMsBase + archetype.dragoon.durationMsPerLevel * (level - 1);
}
