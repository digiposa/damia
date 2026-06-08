import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import { CHARACTER_SPRITE_DEFAULTS } from '@gameplay/components/Sprite';
import type { Entity, World } from '@core/ecs';
import {
  type CharacterAvatar,
  DART,
  getCharacterStatsAtLevel,
  xpToReachLevel,
} from '@data/characters';
import { totalEquipmentBonuses } from '@data/equipment';

export interface SpawnPlayerOptions {
  gx: number;
  gy: number;
  /** Override starting HP (clamped to max). Defaults to the
   *  archetype's row HP at the spawn level. */
  hp?: number;
  /** Which playable avatar to spawn. Defaults to Dart so legacy
   *  call sites that don't yet pass one keep their old behaviour.
   *  Stats come from `avatar.archetype`. */
  avatar?: CharacterAvatar;
  /** Override starting character level. Defaults to the avatar's
   *  `joinLevel` (TLoD canon: Dart 1, Lavitz 4, Shana 5, etc.) so
   *  Survival picks land each character with their canon-join HP /
   *  ATK / DEF, not Dart's LV1 placeholder values. Story zones can
   *  override per scene if a save restore demands a different LV. */
  startLevel?: number;
}

/**
 * Spawn a player entity at (gx, gy). Stats, action-RPG fields and
 * the per-level row at the spawn level all come from the avatar's
 * archetype. Sprite bundle comes from the avatar's base form. A
 * `Character` component holds the avatar reference so downstream
 * systems (DeathSystem level-up, CombatSystem ranged branch,
 * DragoonSystem) can read avatar + archetype + dragoon config
 * without an extra registry lookup.
 */
export function spawnPlayer(world: World<Components>, opts: SpawnPlayerOptions): Entity {
  const avatar = opts.avatar ?? DART;
  const archetype = avatar.archetype;
  const { x, y } = gridToWorld(opts.gx, opts.gy);
  const id = world.createEntity();
  const startLevel = opts.startLevel ?? avatar.joinLevel ?? 1;
  const startRow = getCharacterStatsAtLevel(archetype, startLevel);
  const max = startRow.hp;
  const startHp = Math.max(1, Math.min(max, opts.hp ?? max));

  world.addComponent(id, 'Player', {});
  // Dragoon form is locked at spawn. In Survival the LevelUpChoiceModal
  // `dragoonUnlock` upgrade flips it on (gated behind the first boss
  // kill); Story flips it via narrative events (not yet implemented).
  world.addComponent(id, 'Character', { avatar, dragoonUnlocked: false });
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
    ...CHARACTER_SPRITE_DEFAULTS,
    shape: 'capsule',
    color: 0xc8201f,
    width: 54,
    height: 81,
    textureAlias: avatar.sprite.base.idle,
    attackTextureAlias: avatar.sprite.base.attack,
    defendTextureAlias: avatar.sprite.base.defend,
  });
  world.addComponent(id, 'Health', {
    current: startHp,
    max,
  });
  // Bake equipment bonuses on top of the per-level row. Re-applied
  // by DeathSystem.awardXp on every level-up so the row reset doesn't
  // wipe them. Effects-only items (elemental damage, status chance,
  // SP modifiers, +Max HP/MP, ...) are noted on EQUIPMENT[slug].effect
  // and consumed by their owning systems when those ship.
  const eq = totalEquipmentBonuses(avatar.startingEquipment, archetype.id);
  world.addComponent(id, 'Stats', {
    ...archetype.actionStats.base,
    atk: startRow.atk + eq.atk,
    def: startRow.def + eq.def,
    magicAtk: startRow.magicAtk + eq.magicAtk,
    magicDef: startRow.magicDef + eq.magicDef,
    speed: archetype.actionStats.base.speed + eq.speed,
    attackHit: archetype.actionStats.base.attackHit + eq.attackHit,
    magicHit: archetype.actionStats.base.magicHit + eq.magicHit,
    attackAvoid: archetype.actionStats.base.attackAvoid + eq.attackAvoid,
    magicAvoid: archetype.actionStats.base.magicAvoid + eq.magicAvoid,
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
  // XP is cumulative lifetime — when the avatar spawns at a non-LV1
  // join level, seed `xp` to the canon cumulative threshold for that
  // level so the next level-up requires the canon delta (matching
  // TLoD's progression curve). additionUses stays empty; every
  // addition starts at Lv 1 with 0 uses, gated by the controller.
  world.addComponent(id, 'Progression', {
    level: startLevel,
    xp: xpToReachLevel(archetype, startLevel),
    xpToNext: xpToReachLevel(archetype, startLevel + 1),
    additionUses: {},
  });

  return id;
}
