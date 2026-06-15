import type { Texture } from 'pixi.js';
import { Assets, Rectangle, Texture as PixiTexture } from 'pixi.js';

/**
 * Asset manifest entry. All assets are textures since M8; placeholder support
 * is gone (entities that don't have an alias just rely on their Sprite
 * component's `shape`/`color` fallback in RenderSystem).
 */
export interface TextureAsset {
  kind: 'texture';
  url: string;
  /**
   * If true, the texture's `frame` is shrunk at load time to the alpha
   * bounding box of its non-transparent pixels. Lets sprites that were
   * cropped from a sprite sheet with inconsistent transparent padding
   * (different feet-to-canvas-bottom distances, different head margins,
   * varying widths) render with a stable bottom-anchored size — the
   * Pixi.Sprite anchor (0.5, 1) latches onto the actual character feet
   * instead of the empty canvas edge, and `fitMode='height'` resolves
   * against the character height instead of the canvas height. One
   * synchronous alpha scan per sprite at preload — runs once during
   * splash, negligible cost.
   */
  autoTrim?: boolean;
  /**
   * Categorization tags. Tags drive on-demand loading via
   * `AssetManager.loadCategory(tag)` and reference-counted eviction via
   * `unloadCategory(tag)`. An entry with NO tags is considered "core" —
   * always loaded at boot, never evictable. Common tag families:
   *   - `core`      → always-resident UI (title bg, cursors, dragoon eye)
   *   - `vfx`       → spell VFX (small, used across zones — keep resident)
   *   - `item`      → item icons (used by HUD/inventory in every zone)
   *   - `player:X`  → character X's sprite set
   *   - `mob:X`     → mob kind X's sprite set
   *   - `zone:X`    → zone-specific tiles / maps / props / NPCs
   * Designed to scale to ~2000 assets: only the active zone's slice +
   * the current party's chars are resident at any one time.
   */
  tags?: readonly AssetTag[];
}

/**
 * Union of every tag string used in the manifest. Kept as a wide
 * `string` template so authors can mint new tags inline without
 * having to register them up-front, while still narrowing common
 * roots for autocomplete and typo-safety on the AssetManager API.
 */
export type AssetTag =
  | 'core'
  | 'vfx'
  | 'item'
  | `player:${string}`
  | `mob:${string}`
  | `zone:${string}`;

const MANIFEST = {
  // Dart sprite (M8) — central hero shot extracted from `jau5sf...png` via rembg.
  // `autoTrim` on every pose so feet land on the tile floor consistently
  // regardless of per-pose canvas padding (the poses were sliced from a
  // sprite sheet and each has slightly different transparent margins).
  'sprite.player.dart': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // Attack pose used during AttackSwing — dynamic two-handed combat stance.
  // Static fallback for the Sprite.attackTextureAlias field; the live
  // 3-frame sequence below drives the actual swing animation via RenderSystem
  // when DART.sprite.base.attackFrames is declared.
  'sprite.player.dart.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // 3-frame basic-attack animation (wind-up → strike → follow-through).
  // RenderSystem splits AttackSwing duration evenly across the array.
  'sprite.player.dart.attack.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-1.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  'sprite.player.dart.attack.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-2.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  'sprite.player.dart.attack.3': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-3.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // 2-frame walk cycle. RenderSystem swaps between them while the entity
  // has active Pathfinder waypoints (and no swing / addition / spell /
  // defend taking over). Cycle period is fixed; a per-entity phase
  // offset desyncs swarms so they don't step in lockstep.
  'sprite.player.dart.walk.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-walk-1.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  'sprite.player.dart.walk.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-walk-2.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // Defend pose held while the Defending component is present.
  'sprite.player.dart.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // Double Slash addition — 2-frame follow-up after the basic 3-frame
  // swing (wind-up across body → horizontal arc with VFX trail). Combined
  // with the basic attackFrames in DART.sprite.base.additions.doubleSlash
  // to render the full "double slash" sequence in a single Addition tick.
  'sprite.player.dart.doubleSlash.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-double-slash-1.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  'sprite.player.dart.doubleSlash.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-double-slash-2.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // Red-Eye Dragoon form — single pose reused for idle / attack /
  // defend until pose variants exist.
  'sprite.player.dart.dragoon': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-dragoon.png',
    autoTrim: true,
    tags: ['player:dart'],
  },
  // Dart portrait used in the HUD (top-left of the screen, in the portrait slot).
  'ui.portrait.dart': {
    kind: 'texture',
    url: '/assets/ui/dart-portrait.png',
    tags: ['player:dart'],
  },

  // Shana — childhood friend, future White-Silver Dragoon. Two poses
  // available: standing (idle/defend) and bow draw (attack). Update
  // dimensions in MOBS-equivalent / character sprite block if the
  // native ratio shifts.
  'sprite.player.shana': {
    kind: 'texture',
    url: '/assets/sprites/player/shana.png',
    tags: ['player:shana'],
  },
  'sprite.player.shana.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/shana-attack.png',
    tags: ['player:shana'],
  },
  // No dedicated defend pose yet — reuse the idle so the Defending
  // component visual at least doesn't fall back to the bow-draw.
  'sprite.player.shana.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/shana.png',
    tags: ['player:shana'],
  },

  // Meru — Wind/Water Dragoon (TLoD's Blue-Sea Dragoon). Single
  // pose available for now, reused across idle / attack / defend.
  // Replace with dedicated PNGs as soon as we have pose variants.
  'sprite.player.meru': {
    kind: 'texture',
    url: '/assets/sprites/player/meru.png',
    tags: ['player:meru'],
  },
  'sprite.player.meru.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/meru.png',
    tags: ['player:meru'],
  },
  'sprite.player.meru.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/meru.png',
    tags: ['player:meru'],
  },

  // --- Remaining TLoD party placeholders --------------------------
  // Every alias below resolves to Dart's PNGs until dedicated art
  // ships. Swap the URLs (or drop new PNGs at /assets/sprites/player/
  // and update the references) when sprites land. Characters are
  // wired all the way through the engine + CHARACTERS registry, so
  // the swap is purely a content drop — no code change needed.
  // Lavitz — Jade Dragoon. Four poses: standing (idle), spear thrust
  // (attack), shield-up (defend), and the Harpoon 2nd-hit arc.
  // The 1st hit of Harpoon reuses the attack pose, mirroring Dart's
  // Double Slash. Albert keeps Dart placeholders until his own art
  // ships (same archetype, distinct avatar).
  'sprite.player.lavitz': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz.png',
    tags: ['player:lavitz'],
  },
  'sprite.player.lavitz.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-attack.png',
    tags: ['player:lavitz'],
  },
  'sprite.player.lavitz.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-defend.png',
    tags: ['player:lavitz'],
  },
  'sprite.player.lavitz.harpoon.2': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-harpoon-2.png',
    tags: ['player:lavitz'],
  },
  'sprite.player.rose': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    tags: ['player:rose'],
  },
  'sprite.player.rose.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    tags: ['player:rose'],
  },
  'sprite.player.rose.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    tags: ['player:rose'],
  },
  'sprite.player.haschel': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    tags: ['player:haschel'],
  },
  'sprite.player.haschel.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    tags: ['player:haschel'],
  },
  'sprite.player.haschel.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    tags: ['player:haschel'],
  },
  'sprite.player.albert': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    tags: ['player:albert'],
  },
  'sprite.player.albert.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    tags: ['player:albert'],
  },
  'sprite.player.albert.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    tags: ['player:albert'],
  },
  'sprite.player.kongol': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    tags: ['player:kongol'],
  },
  'sprite.player.kongol.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    tags: ['player:kongol'],
  },
  'sprite.player.kongol.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    tags: ['player:kongol'],
  },
  'sprite.player.miranda': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    tags: ['player:miranda'],
  },
  'sprite.player.miranda.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    tags: ['player:miranda'],
  },
  'sprite.player.miranda.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    tags: ['player:miranda'],
  },
  // Main menu background (TLoD title screen). Tagged `core` so it's
  // resident at boot — title screen is the very first thing painted.
  'ui.mainscreen': { kind: 'texture', url: '/assets/ui/mainscreen.jpg', tags: ['core'] },
  // Endiness overworld map — backdrop of WorldMapScene with fog-of-war markers.
  'ui.worldmap': { kind: 'texture', url: '/assets/ui/worldmap.png', tags: ['zone:worldmap'] },
  // Animated attack cursor frames — cycled by CursorOverlay when hovering an enemy.
  'cursor.sword.1': { kind: 'texture', url: '/assets/ui/cursor/sword-1.png', tags: ['core'] },
  'cursor.sword.2': { kind: 'texture', url: '/assets/ui/cursor/sword-2.png', tags: ['core'] },
  'cursor.sword.3': { kind: 'texture', url: '/assets/ui/cursor/sword-3.png', tags: ['core'] },

  // Item icons (used both in the world-drop sprite and the Hotbar slot badge).
  // Tagged `item` — the inventory / hotbar painters can render any item from
  // anywhere in the game (drops, gifts, etc.), so we keep the full set
  // resident rather than gating loading by zone-specific drop tables.
  'sprite.item.healingPotion': {
    kind: 'texture',
    url: '/assets/items/healing-potion.png',
    tags: ['item'],
  },
  'sprite.item.burnOut': {
    kind: 'texture',
    url: '/assets/items/burn-out.png',
    tags: ['item'],
  },
  // Unified magic spell icon. Every spell-class item points to this base
  // (instead of carrying its own bespoke art); the slot painter tints it
  // by SPELLS[spell].element and stamps a corner badge for the target
  // mode (single vs ground AoE) so all 14 element × target combos are
  // distinguishable without per-spell PNGs.
  'sprite.spell.magicBase': {
    kind: 'texture',
    url: '/assets/spells/magic-base.png',
    tags: ['item'],
  },
  // Dragoon transform button — 3-frame "eye opens" animation. Frame
  // index reflects the SP gauge fill (closed = empty / half = half-full
  // / open = ready), so the player reads the form's readiness at a
  // glance instead of having to parse a numeric bar. Lifted from the
  // PS1 TLoD command icon palette to keep the visual identity canon.
  'ui.dragoon.eye.1': {
    kind: 'texture',
    url: '/assets/spells/dragoon-eye-1.png',
    tags: ['core'],
  },
  'ui.dragoon.eye.2': {
    kind: 'texture',
    url: '/assets/spells/dragoon-eye-2.png',
    tags: ['core'],
  },
  'ui.dragoon.eye.3': {
    kind: 'texture',
    url: '/assets/spells/dragoon-eye-3.png',
    tags: ['core'],
  },

  // Spell impact VFX textures — drawn by VfxSystem (sprite-based kinds).
  // Tagged `vfx` so they ride along with `core` at boot (small, used
  // across every zone, not worth lazy-loading).
  'vfx.fireImpact': { kind: 'texture', url: '/assets/vfx/burn-out.png', tags: ['vfx'] },

  // NPC sprites. Merchant lives in the Forest of Seles save area.
  'sprite.npc.merchant': {
    kind: 'texture',
    url: '/assets/sprites/npc/merchant.png',
    tags: ['zone:forest'],
  },

  // M8 mob textures extracted from `02 Forest.png` showcase via rembg.
  // Each mob carries its own `mob:<kind>` tag so Training mode can pull
  // them on demand; their host zone(s) ALSO list the same tags in their
  // requiredTags, so the Forest preload covers the encounter pool
  // without each mob having to declare what zone it spawns in.
  'sprite.mob.berserkMouse': {
    kind: 'texture',
    url: '/assets/sprites/mobs/berserkMouse.png',
    tags: ['mob:berserkMouse'],
  },
  'sprite.mob.berserkMouse.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/berserkMouse-attack.png',
    tags: ['mob:berserkMouse'],
  },
  'sprite.mob.berserkMouse.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/berserkMouse-death.png',
    tags: ['mob:berserkMouse'],
  },
  'sprite.mob.goblin': {
    kind: 'texture',
    url: '/assets/sprites/mobs/goblin.png',
    tags: ['mob:goblin'],
  },
  'sprite.mob.goblin.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/goblin-attack.png',
    tags: ['mob:goblin'],
  },
  'sprite.mob.goblin.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/goblin-death.png',
    tags: ['mob:goblin'],
  },
  'sprite.mob.assassinCock': {
    kind: 'texture',
    url: '/assets/sprites/mobs/assassinCock.png',
    tags: ['mob:assassinCock'],
  },
  'sprite.mob.assassinCock.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/assassinCock-attack.png',
    tags: ['mob:assassinCock'],
  },
  'sprite.mob.assassinCock.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/assassinCock-death.png',
    tags: ['mob:assassinCock'],
  },
  'sprite.mob.trent': {
    kind: 'texture',
    url: '/assets/sprites/mobs/trent.png',
    tags: ['mob:trent'],
  },
  'sprite.mob.trent.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/trent-attack.png',
    tags: ['mob:trent'],
  },
  'sprite.mob.trent.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/trent-death.png',
    tags: ['mob:trent'],
  },

  // Bosses. Fruegel — single sprite, reused for idle / attack / death
  // poses until pose-specific variants get generated. Native size is
  // 152×199; MOBS.fruegel.sprite.width/height drive the on-screen
  // dimensions and the AI scales accordingly.
  'sprite.mob.fruegel': {
    kind: 'texture',
    url: '/assets/sprites/mobs/fruegel.png',
    tags: ['mob:fruegel'],
  },
  'sprite.mob.fruegel.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/fruegel.png',
    tags: ['mob:fruegel'],
  },
  'sprite.mob.fruegel.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/fruegel.png',
    tags: ['mob:fruegel'],
  },

  // Knight of Sandora — shared sprite across the Seles + Kazas variants
  // (user-supplied 2026-06-11). Idle pose + a 2-frame walk cycle.
  // No dedicated attack / death pose yet — the renderer will fall back
  // to the idle texture during those states. Both MobKind variants
  // tag the same assets so spawnMob's prefetch fires for either.
  'sprite.mob.knightOfSandora': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.walk.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-walk-1.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.walk.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-walk-2.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.attack.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-attack-1.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.attack.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-attack-2.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.throw.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-throw-1.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.throw.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-throw-2.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },
  'sprite.mob.knightOfSandora.throw.3': {
    kind: 'texture',
    url: '/assets/sprites/mobs/knightOfSandora-throw-3.png',
    autoTrim: true,
    tags: ['mob:knightOfSandoraSeles', 'mob:knightOfSandoraKazas'],
  },

  // Commander (Seles) — boss canon Disc 1. Idle pose only for now;
  // walk / attack / spell-cast / death frames pending.
  'sprite.mob.commander': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.walk.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-walk-1.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.walk.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-walk-2.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.attack.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-attack-1.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.attack.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-attack-2.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.cast': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-cast.png',
    autoTrim: true,
    tags: ['mob:commanderSeles'],
  },
  // Power Up transformation animation — 2 frames split across the
  // PowerUp window (~900 ms total). Frame 1 = build-up stance, red
  // aura on arms + cape. Frame 2 = peak transformation, arms wide
  // with a glowing crimson core, "fully changed" stance before he
  // returns to his combat chassis. When the window ends the boss
  // reverts to its standard pipeline with `AI.poweredUp = true`
  // (Slash Twice replaces Sword Slash, Burn Out × 1.5).
  //
  // autoTrim deliberately off — both frames are pre-padded to a
  // uniform 402×506 canvas with the figure bottom-centered. Each
  // frame's aura extends differently (frame 1 sideways, frame 2
  // vertically), so an autoTrim pass would crop them to mismatched
  // alpha boxes and the boss would visibly shrink / grow between
  // the two poses with fitMode='height'. Keeping the full canvas
  // means both render at the same effective scale.
  'sprite.mob.commander.powerup.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-powerup-1.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.powerup.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-powerup-2.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.1': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-1.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.2': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-2.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.3': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-3.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.4': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-4.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.5': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-5.png',
    tags: ['mob:commanderSeles'],
  },
  'sprite.mob.commander.death.6': {
    kind: 'texture',
    url: '/assets/sprites/mobs/commander-death-6.png',
    tags: ['mob:commanderSeles'],
  },

  // M8 forest tiles.
  // Ground = first Gemini grass variant (sampled into iso-diamond Graphics fills,
  // so its white bg is naturally clipped by the polygon shape).
  // Path = procedurally generated dirt texture (256x128, edge-to-edge, no border)
  // matching the TLoD `01.png` forest reference palette.
  'tile.forest.ground': {
    kind: 'texture',
    url: '/assets/tiles/forest/grass-procedural.png',
    tags: ['zone:forest'],
  },
  'tile.forest.path.1': {
    kind: 'texture',
    url: '/assets/tiles/forest/dirt-procedural.png',
    tags: ['zone:forest'],
  },

  // Pre-rendered iso backdrop for the Survival arena. Bypasses the
  // per-tile `TileMap` composition in favour of a single painted
  // texture stretched to the iso world bounds (see PrerenderedMap.ts).
  // To enable:
  //   1. Drop the PNG at public/assets/maps/forest-survival.png.
  //      Author at a 2:1 aspect ratio (iso projection is twice as
  //      wide as tall) — for our 32x32 grid that's a target of
  //      2048x1024 native, or any 2:1 multiple.
  //   2. Uncomment the entry below.
  //   3. Set `prerenderedMapAsset: 'map.forest.survival'` in
  //      ArenaScene's overrides block.
  // The fallback to TileMap stays automatic if the alias is
  // commented or the texture fails to load.
  'map.forest.survival': {
    kind: 'texture',
    url: '/assets/maps/forest-survival.png',
    tags: ['zone:forestArena'],
  },
  // Training arena — desert ruins backdrop (user-supplied 2026-06-11,
  // 1440x720 native, perfect 2:1 iso ratio → ARENA_SIZE = 11 same as
  // the Forest Survival arena).
  'map.training.arena': {
    kind: 'texture',
    url: '/assets/maps/training-arena.png',
    tags: ['zone:trainingArena'],
  },

  // 16 tree variants (rows 1+2 of Gemini sheet B).
  'sprite.prop.tree.1': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-01.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.2': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-02.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.3': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-03.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.4': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-04.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.5': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-05.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.6': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-06.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.7': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-07.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.8': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-08.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.9': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-09.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.10': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-10.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.11': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-11.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.12': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-12.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.13': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-13.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.14': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-14.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.15': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-15.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.tree.16': {
    kind: 'texture',
    url: '/assets/sprites/props/tree-16.png',
    tags: ['zone:forest'],
  },
  // Cliff blocks (used as 'rock' props).
  'sprite.prop.rock.1': {
    kind: 'texture',
    url: '/assets/sprites/props/rock-01.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.rock.2': {
    kind: 'texture',
    url: '/assets/sprites/props/rock-02.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.rock.3': {
    kind: 'texture',
    url: '/assets/sprites/props/rock-03.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.rock.4': {
    kind: 'texture',
    url: '/assets/sprites/props/rock-04.png',
    tags: ['zone:forest'],
  },
  // Gnarled props.
  'sprite.prop.log.1': {
    kind: 'texture',
    url: '/assets/sprites/props/log-01.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.stump.1': {
    kind: 'texture',
    url: '/assets/sprites/props/stump-01.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.branch.1': {
    kind: 'texture',
    url: '/assets/sprites/props/branch-01.png',
    tags: ['zone:forest'],
  },
  'sprite.prop.vine.1': {
    kind: 'texture',
    url: '/assets/sprites/props/vine-01.png',
    tags: ['zone:forest'],
  },
} as const satisfies Record<string, TextureAsset>;

export type AssetAlias = keyof typeof MANIFEST;

const TEXTURES = new Map<AssetAlias, Texture>();
/** In-flight loads keyed by alias, so two concurrent `loadCategory()` calls
 *  that overlap on an alias share a single network round-trip. */
const PENDING = new Map<AssetAlias, Promise<void>>();
/** Reference count per tag — how many `loadCategory()` calls hold the tag
 *  alive. Zero means the tag is unloaded (textures may still be resident
 *  if another tag references them). */
const TAG_REFCOUNTS = new Map<AssetTag, number>();
/** Precomputed reverse index: every alias that carries each tag. Filled
 *  lazily on first lookup so tests that import partially mock MANIFEST
 *  still work. */
let TAG_INDEX: Map<AssetTag, AssetAlias[]> | null = null;

/**
 * Prepend Vite's `BASE_URL` to a manifest path. Production builds for GitHub
 * Pages are served from `/damia/`, so a manifest URL like `/assets/foo.png`
 * has to become `/damia/assets/foo.png` at runtime — otherwise the browser
 * 404s. Dev mode has BASE_URL = `/` so the original path is preserved.
 */
function resolveAssetUrl(manifestUrl: string): string {
  const base = import.meta.env.BASE_URL || '/';
  // Strip leading slash from the manifest path so `base + path` doesn't
  // produce a double `//`.
  return base + manifestUrl.replace(/^\//, '');
}

/**
 * Load an image as an HTMLImageElement (browser HTTP-cached, so this
 * round-trip after Pixi.Assets has already loaded the same URL is
 * effectively free). Used by `autoTrim` to read pixel data without
 * needing a Pixi renderer in scope.
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image for autoTrim: ${url}`));
    img.src = url;
  });
}

/**
 * Walk the image's alpha channel and return the tight rectangle around
 * non-transparent pixels. Returns null for an empty / fully transparent
 * image. Single getImageData call + double loop — a few ms per ~600 px
 * sprite, done once at preload.
 */
function computeAlphaBBox(img: HTMLImageElement): Rectangle | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    const rowBase = y * w;
    for (let x = 0; x < w; x++) {
      if (data[(rowBase + x) * 4 + 3]! > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
}

/**
 * Replace `texture` with a new Texture that shares the same TextureSource
 * but has its `frame` shrunk to the alpha bbox of `url`. Anchors at
 * `(0.5, 1)` then land on the actual character feet instead of the canvas
 * bottom, and `Sprite.fitMode='height'` resolves against the character's
 * intrinsic height instead of whatever empty padding the sprite-sheet
 * crop left behind. Returns the original texture untouched on any failure
 * — keeps preload resilient to one bad asset.
 */
async function autoTrimTexture(texture: Texture, url: string): Promise<Texture> {
  try {
    const img = await loadImageElement(url);
    const bbox = computeAlphaBBox(img);
    if (!bbox) return texture;
    return new PixiTexture({ source: texture.source, frame: bbox });
  } catch (e) {
    // Don't break preload over a single failed trim — fall back to the
    // un-trimmed texture and log so a missing crossOrigin / CSP issue is
    // visible during development.
    console.warn(`[AssetManager] autoTrim failed for ${url}; using untrimmed texture.`, e);
    return texture;
  }
}

/** Build (once) the tag → aliases reverse index from the manifest. */
function tagIndex(): Map<AssetTag, AssetAlias[]> {
  if (TAG_INDEX) return TAG_INDEX;
  const idx = new Map<AssetTag, AssetAlias[]>();
  for (const alias of Object.keys(MANIFEST) as AssetAlias[]) {
    const tags = (MANIFEST[alias] as TextureAsset).tags;
    if (!tags) continue;
    for (const tag of tags) {
      let list = idx.get(tag);
      if (!list) {
        list = [];
        idx.set(tag, list);
      }
      list.push(alias);
    }
  }
  TAG_INDEX = idx;
  return idx;
}

/**
 * Load a single alias once. Subsequent calls hand back the cached Texture
 * immediately. In-flight calls share a single promise so two scenes asking
 * for the same tag don't double-fetch.
 */
function loadAlias(alias: AssetAlias): Promise<void> {
  if (TEXTURES.has(alias)) return Promise.resolve();
  const existing = PENDING.get(alias);
  if (existing) return existing;
  const asset = MANIFEST[alias] as TextureAsset;
  const resolvedUrl = resolveAssetUrl(asset.url);
  const task = Assets.load(resolvedUrl)
    .then(async (tex) => {
      let texture = tex as Texture;
      // Tile textures need REPEAT wrap so polygon-fill samples wrap across
      // the texture boundary (otherwise Pixi clamps to edge and we see seams
      // between adjacent iso diamonds). Sprite textures keep the default.
      if (alias.startsWith('tile.')) {
        texture.source.style.addressMode = 'repeat';
      }
      // Auto-trim opt-in: re-frame the texture to the character's
      // alpha bbox so anchors and fitMode='height' resolve against
      // the actual content, not the canvas with its inconsistent
      // transparent padding (see TextureAsset.autoTrim doc).
      if (asset.autoTrim) {
        texture = await autoTrimTexture(texture, resolvedUrl);
      }
      TEXTURES.set(alias, texture);
    })
    .finally(() => {
      PENDING.delete(alias);
    });
  PENDING.set(alias, task);
  return task;
}

// `aliasIsPinned` (pinned = some loaded tag still references the alias) used
// to gate texture eviction in `unloadCategory`. Removed when eviction was
// disabled — see the unloadCategory doc. Restore it as the per-eviction
// predicate when an LRU eviction pass lands.

export interface PreloadOptions {
  /** Subset of tags to load. If omitted, every alias in the manifest is
   *  loaded — useful for tests / one-shot full-load scenarios. Production
   *  calls always scope this to `['core', 'vfx', 'item']` at boot. */
  tags?: readonly AssetTag[];
  /** Called every time a texture finishes loading. `loaded` is the
   *  count of textures done so far (including the one that just
   *  finished); `total` is the total count for the whole preload.
   *  Used by the boot screen to drive the progress bar; safe to omit. */
  onProgress?: (loaded: number, total: number) => void;
}

export const AssetManager = {
  /** Boot-time preload. Defaults to the always-resident `core/vfx/item`
   *  slice — scenes pull their own zone / mob / player slices via
   *  `loadCategory` at enter. Pass `tags: undefined` for the legacy
   *  "load everything" path (kept for tests). */
  async preload(options: PreloadOptions = {}): Promise<void> {
    const idx = tagIndex();
    let aliases: AssetAlias[];
    if (options.tags) {
      const set = new Set<AssetAlias>();
      for (const tag of options.tags) {
        for (const alias of idx.get(tag) ?? []) set.add(alias);
        TAG_REFCOUNTS.set(tag, (TAG_REFCOUNTS.get(tag) ?? 0) + 1);
      }
      aliases = Array.from(set);
    } else {
      aliases = Object.keys(MANIFEST) as AssetAlias[];
    }
    const total = aliases.length;
    let loaded = 0;
    const tick = (): void => {
      loaded += 1;
      options.onProgress?.(loaded, total);
    };
    await Promise.all(
      aliases.map((alias) =>
        loadAlias(alias)
          .catch((e) => {
            console.warn(`[AssetManager] failed to load ${alias}`, e);
          })
          .finally(tick),
      ),
    );
  },

  /**
   * Load every alias carrying `tag`, bumping its refcount. Idempotent:
   * already-loaded textures resolve instantly; concurrent calls share
   * in-flight promises. Returns the (alias-count, byte-cost-proxy) pair
   * so callers can decide whether to show a loading indicator.
   *
   * SceneManager calls this with each `requiredTags` entry on enter and
   * pairs it with `unloadCategory` on exit. Dynamic / runtime spawns
   * (Training picker, debug commands, future scripted boss summons)
   * should use `prefetchCategory` instead — it loads without pinning,
   * so the scene's refcounts stay the sole source of truth.
   */
  async loadCategory(
    tag: AssetTag,
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<{ loaded: number; total: number }> {
    TAG_REFCOUNTS.set(tag, (TAG_REFCOUNTS.get(tag) ?? 0) + 1);
    const aliases = tagIndex().get(tag) ?? [];
    const total = aliases.length;
    let loaded = 0;
    const tick = (): void => {
      loaded += 1;
      onProgress?.(loaded, total);
    };
    await Promise.all(
      aliases.map((alias) =>
        loadAlias(alias)
          .catch((e) => {
            console.warn(`[AssetManager] failed to load ${alias}`, e);
          })
          .finally(tick),
      ),
    );
    return { loaded, total };
  },

  /** Parallel union of `loadCategory` over many tags. Scenes call this
   *  with their `requiredTags` array at enter. */
  async loadCategories(
    tags: readonly AssetTag[],
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<{ loaded: number; total: number }> {
    if (tags.length === 0) return { loaded: 0, total: 0 };
    // Union of aliases first so the progress count is over the deduped
    // set (a player+zone overlap doesn't double-tick the loading bar).
    const idx = tagIndex();
    const set = new Set<AssetAlias>();
    for (const tag of tags) {
      TAG_REFCOUNTS.set(tag, (TAG_REFCOUNTS.get(tag) ?? 0) + 1);
      for (const alias of idx.get(tag) ?? []) set.add(alias);
    }
    const aliases = Array.from(set);
    const total = aliases.length;
    let loaded = 0;
    const tick = (): void => {
      loaded += 1;
      onProgress?.(loaded, total);
    };
    await Promise.all(
      aliases.map((alias) =>
        loadAlias(alias)
          .catch((e) => {
            console.warn(`[AssetManager] failed to load ${alias}`, e);
          })
          .finally(tick),
      ),
    );
    return { loaded, total };
  },

  /**
   * Load every alias carrying `tag` WITHOUT bumping its refcount. Use
   * for dynamic / runtime spawns where the calling code can't be sure
   * a containing scene already pinned the tag — Training picker dropping
   * a fresh mob, a debug command spawning a boss outside the canon
   * encounter table, etc. Textures landed this way stay resident until
   * a scene transition with no overlapping tag evicts them (zero-refcount
   * aliases get cleared by the next matching `unloadCategory`).
   *
   * Idempotent + cheap when everything's already loaded.
   */
  async prefetchCategory(tag: AssetTag): Promise<void> {
    const aliases = tagIndex().get(tag) ?? [];
    await Promise.all(
      aliases.map((alias) =>
        loadAlias(alias).catch((e) => {
          console.warn(`[AssetManager] failed to prefetch ${alias}`, e);
        }),
      ),
    );
  },

  /**
   * Drop one refcount on `tag`. Textures are NOT destroyed when the
   * count hits zero: we lean on Pixi.Assets' internal URL cache + the
   * browser HTTP cache so a player walking Forest → WorldMap → Forest
   * re-uses the already-resident texture instead of round-tripping
   * the network + GPU upload. The refcount is kept as bookkeeping so a
   * future LRU pass (when total GPU residency exceeds, say, 256 MB on
   * mobile) can pick zero-refcount aliases as the eviction candidates.
   *
   * Calling `destroy(true)` on the way out was the cause of a hard
   * crash when leaving CharacterSelectScene: placeholder avatars
   * (rose / haschel / albert / kongol / miranda) alias `dart.png`, so
   * Pixi.Assets returns the same TextureSource for all of them. Tearing
   * one down with destroy(true) annihilated the shared source and
   * Dart's still-pinned sprite landed on dead GPU memory.
   */
  unloadCategory(tag: AssetTag): void {
    const rc = TAG_REFCOUNTS.get(tag) ?? 0;
    if (rc <= 0) return;
    if (rc > 1) {
      TAG_REFCOUNTS.set(tag, rc - 1);
      return;
    }
    TAG_REFCOUNTS.delete(tag);
    // Textures stay resident — see doc above. No-op beyond the
    // refcount decrement so the cache stays warm for the next visit.
  },

  /** Convenience for scene exit: `unloadCategory` over many tags. */
  unloadCategories(tags: readonly AssetTag[]): void {
    for (const tag of tags) this.unloadCategory(tag);
  },

  get(alias: AssetAlias): TextureAsset {
    const a = MANIFEST[alias];
    if (!a) throw new Error(`Unknown asset alias: ${alias}`);
    return a;
  },

  getTexture(alias: AssetAlias): Texture | null {
    return TEXTURES.get(alias) ?? null;
  },

  /** True if the alias's texture is already resident in the cache. Lets
   *  the RenderSystem auto-heal pass tell at zero cost whether a fallback
   *  Graphics node is ready for promotion to a Pixi.Sprite. */
  isLoaded(alias: AssetAlias): boolean {
    return TEXTURES.has(alias);
  },
} as const;
