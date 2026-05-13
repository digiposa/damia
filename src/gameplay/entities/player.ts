import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import type { Entity, World } from '@core/ecs';
import {
  type CharacterAvatar,
  DART,
  getCharacterStatsAtLevel,
  xpToReachLevel,
} from '@data/characters';

export interface SpawnPlayerOptions {
  gx: number;
  gy: number;
  /** Override starting HP (clamped to max). Defaults to the
   *  archetype's LV1 HP. */
  hp?: number;
  /** Which playable avatar to spawn. Defaults to Dart so legacy
   *  call sites that don't yet pass one keep their old behaviour.
   *  Stats come from `avatar.archetype`. */
  avatar?: CharacterAvatar;
}

/**
 * Spawn a player entity at (gx, gy). Stats, action-RPG fields and
 * the per-level row at LV 1 all come from the avatar's archetype.
 * Sprite bundle comes from the avatar's base form. A `Character`
 * component holds the avatar reference so downstream systems
 * (DeathSystem level-up, CombatSystem ranged branch, future
 * DragoonSystem) can read avatar + archetype + dragoon config
 * without an extra registry lookup.
 */
export function spawnPlayer(world: World<Components>, opts: SpawnPlayerOptions): Entity {
  const avatar = opts.avatar ?? DART;
  const archetype = avatar.archetype;
  const { x, y } = gridToWorld(opts.gx, opts.gy);
  const id = world.createEntity();
  const lvl1 = getCharacterStatsAtLevel(archetype, 1);
  const max = lvl1.hp;
  const startHp = Math.max(1, Math.min(max, opts.hp ?? max));

  world.addComponent(id, 'Player', {});
  world.addComponent(id, 'Character', { avatar });
  world.addComponent(id, 'Position', { x, y });
  world.addComponent(id, 'Speed', { value: archetype.actionStats.moveSpeed });
  world.addComponent(id, 'Pathfinder', {
    targetGrid: null,
    waypoints: null,
    computing: false,
  });
  // Base-form sprite. The DragoonSystem swaps the alias trio to
  // avatar.sprite.dragoon.* on transform entry. Addition frames are
  // NOT stored on Sprite — RenderSystem looks them up live from
  // avatar.sprite.base.additions[addition.kind] each render frame.
  world.addComponent(id, 'Sprite', {
    shape: 'capsule',
    color: 0xc8201f,
    width: 54,
    height: 81,
    layer: 'entities',
    fitMode: 'height',
    textureAlias: avatar.sprite.base.idle,
    attackTextureAlias: avatar.sprite.base.attack,
    defendTextureAlias: avatar.sprite.base.defend,
  });
  world.addComponent(id, 'Health', {
    current: startHp,
    max,
  });
  world.addComponent(id, 'Stats', {
    ...archetype.actionStats.base,
    atk: lvl1.atk,
    def: lvl1.def,
    magicAtk: lvl1.magicAtk,
    magicDef: lvl1.magicDef,
  });
  world.addComponent(id, 'Faction', { side: 'player' });
  world.addComponent(id, 'AttackCooldown', { remainingMs: 0 });
  world.addComponent(id, 'SkillCooldown', { remainingMs: {} });
  world.addComponent(id, 'Inventory', { items: {}, gold: 0 });
  // SP gauge — fills via combat actions, drives the Dragoon
  // transformation. Per-archetype cap (see DragoonConfig.spMax).
  world.addComponent(id, 'SpGauge', {
    current: 0,
    max: archetype.dragoon.spMax,
  });
  // xpToNext = cumulative XP threshold to reach LV 2 (= 20 for Dart).
  // additionUses starts empty — every addition is at Lv 1 with 0 uses
  // and gets incremented on each trigger by the controller.
  world.addComponent(id, 'Progression', {
    level: 1,
    xp: 0,
    xpToNext: xpToReachLevel(archetype, 2),
    additionUses: {},
  });

  return id;
}
