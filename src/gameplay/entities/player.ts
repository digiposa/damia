import { gridToWorld } from '@core/math/iso';
import type { Components } from '@gameplay/components';
import type { Entity, World } from '@core/ecs';
import {
  type CharacterDef,
  DART,
  getCharacterStatsAtLevel,
  xpToReachLevel,
} from '@data/characters';

export interface SpawnPlayerOptions {
  gx: number;
  gy: number;
  /** Override starting HP (clamped to max). Defaults to the
   *  character's LV1 HP. */
  hp?: number;
  /** Which playable character to spawn. Defaults to Dart so
   *  Story-mode callers that don't yet pass a character keep
   *  their old behaviour. */
  character?: CharacterDef;
}

/**
 * Spawn a player entity at (gx, gy). Stats, sprite aliases, base
 * action-RPG fields and the per-level row at LV1 all come from the
 * passed `character` (defaulting to Dart). A `Character` component
 * is attached so downstream systems (DeathSystem, future ranged
 * CombatSystem) can read the def without an extra registry lookup.
 */
export function spawnPlayer(world: World<Components>, opts: SpawnPlayerOptions): Entity {
  const character = opts.character ?? DART;
  const { x, y } = gridToWorld(opts.gx, opts.gy);
  const id = world.createEntity();
  const lvl1 = getCharacterStatsAtLevel(character, 1);
  const max = lvl1.hp;
  const startHp = Math.max(1, Math.min(max, opts.hp ?? max));

  world.addComponent(id, 'Player', {});
  world.addComponent(id, 'Character', { def: character });
  world.addComponent(id, 'Position', { x, y });
  world.addComponent(id, 'Speed', { value: character.actionStats.moveSpeed });
  world.addComponent(id, 'Pathfinder', {
    targetGrid: null,
    waypoints: null,
    computing: false,
  });
  // Sprite uses the character's texture aliases. Shape/color are the
  // fallback if the texture failed to load. The Sprite component's
  // `additionTextureAliases` is a flat 2-entry array (1st-hit frame,
  // 2nd-hit frame for Double Slash); we read it from the character's
  // doubleSlash sequence — future additions will rework this once
  // RenderSystem grows a per-addition lookup.
  world.addComponent(id, 'Sprite', {
    shape: 'capsule',
    color: 0xc8201f,
    width: 54,
    height: 81,
    layer: 'entities',
    fitMode: 'height',
    textureAlias: character.sprite.idle,
    attackTextureAlias: character.sprite.attack,
    defendTextureAlias: character.sprite.defend,
    additionTextureAliases: character.sprite.additions.doubleSlash ?? [character.sprite.attack],
  });
  world.addComponent(id, 'Health', {
    current: startHp,
    max,
  });
  world.addComponent(id, 'Stats', {
    ...character.actionStats.base,
    atk: lvl1.atk,
    def: lvl1.def,
    magicAtk: lvl1.magicAtk,
    magicDef: lvl1.magicDef,
  });
  world.addComponent(id, 'Faction', { side: 'player' });
  world.addComponent(id, 'AttackCooldown', { remainingMs: 0 });
  world.addComponent(id, 'SkillCooldown', { remainingMs: {} });
  world.addComponent(id, 'Inventory', { items: {}, gold: 0 });
  // xpToNext = cumulative XP threshold to reach LV 2 (= 20 for Dart).
  world.addComponent(id, 'Progression', {
    level: 1,
    xp: 0,
    xpToNext: xpToReachLevel(character, 2),
  });

  return id;
}
