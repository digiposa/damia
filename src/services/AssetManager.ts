import type { Texture } from 'pixi.js';
import { Assets } from 'pixi.js';

/**
 * Asset manifest entry. All assets are textures since M8; placeholder support
 * is gone (entities that don't have an alias just rely on their Sprite
 * component's `shape`/`color` fallback in RenderSystem).
 */
export interface TextureAsset {
  kind: 'texture';
  url: string;
}

const MANIFEST = {
  // Dart sprite (M8) — central hero shot extracted from `jau5sf...png` via rembg.
  'sprite.player.dart': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  // Attack pose used during AttackSwing — central hero shot from `htn4pr...png`.
  'sprite.player.dart.attack': { kind: 'texture', url: '/assets/sprites/player/dart-attack.png' },
  // Defend pose held while the Defending component is present.
  'sprite.player.dart.defend': { kind: 'texture', url: '/assets/sprites/player/dart-defend.png' },
  // Double Slash 2nd-hit pose. The 1st hit reuses sprite.player.dart.attack.
  'sprite.player.dart.doubleSlash.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-doubleSlash-2.png',
  },
  // Red-Eye Dragoon form — single pose reused for idle / attack /
  // defend until pose variants exist.
  'sprite.player.dart.dragoon': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-dragoon.png',
  },
  // Dart portrait used in the HUD (top-left of the screen, in the portrait slot).
  'ui.portrait.dart': { kind: 'texture', url: '/assets/ui/dart-portrait.png' },

  // Shana — childhood friend, future White-Silver Dragoon. Two poses
  // available: standing (idle/defend) and bow draw (attack). Update
  // dimensions in MOBS-equivalent / character sprite block if the
  // native ratio shifts.
  'sprite.player.shana': { kind: 'texture', url: '/assets/sprites/player/shana.png' },
  'sprite.player.shana.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/shana-attack.png',
  },
  // No dedicated defend pose yet — reuse the idle so the Defending
  // component visual at least doesn't fall back to the bow-draw.
  'sprite.player.shana.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/shana.png',
  },

  // Meru — Wind/Water Dragoon (TLoD's Blue-Sea Dragoon). Single
  // pose available for now, reused across idle / attack / defend.
  // Replace with dedicated PNGs as soon as we have pose variants.
  'sprite.player.meru': { kind: 'texture', url: '/assets/sprites/player/meru.png' },
  'sprite.player.meru.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/meru.png',
  },
  'sprite.player.meru.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/meru.png',
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
  'sprite.player.lavitz': { kind: 'texture', url: '/assets/sprites/player/lavitz.png' },
  'sprite.player.lavitz.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-attack.png',
  },
  'sprite.player.lavitz.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-defend.png',
  },
  'sprite.player.lavitz.harpoon.2': {
    kind: 'texture',
    url: '/assets/sprites/player/lavitz-harpoon-2.png',
  },
  'sprite.player.rose': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  'sprite.player.rose.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
  },
  'sprite.player.rose.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
  },
  'sprite.player.haschel': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  'sprite.player.haschel.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
  },
  'sprite.player.haschel.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
  },
  'sprite.player.albert': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  'sprite.player.albert.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
  },
  'sprite.player.albert.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
  },
  'sprite.player.kongol': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  'sprite.player.kongol.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
  },
  'sprite.player.kongol.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
  },
  'sprite.player.miranda': { kind: 'texture', url: '/assets/sprites/player/dart.png' },
  'sprite.player.miranda.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
  },
  'sprite.player.miranda.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
  },
  // Main menu background (TLoD title screen).
  'ui.mainscreen': { kind: 'texture', url: '/assets/ui/mainscreen.jpg' },
  // Endiness overworld map — backdrop of WorldMapScene with fog-of-war markers.
  'ui.worldmap': { kind: 'texture', url: '/assets/ui/worldmap.png' },
  // Animated attack cursor frames — cycled by CursorOverlay when hovering an enemy.
  'cursor.sword.1': { kind: 'texture', url: '/assets/ui/cursor/sword-1.png' },
  'cursor.sword.2': { kind: 'texture', url: '/assets/ui/cursor/sword-2.png' },
  'cursor.sword.3': { kind: 'texture', url: '/assets/ui/cursor/sword-3.png' },

  // Item icons (used both in the world-drop sprite and the Hotbar slot badge).
  'sprite.item.healingPotion': { kind: 'texture', url: '/assets/items/healing-potion.png' },
  'sprite.item.burnOut': { kind: 'texture', url: '/assets/items/burn-out.png' },

  // Spell impact VFX textures — drawn by VfxSystem (sprite-based kinds).
  'vfx.fireImpact': { kind: 'texture', url: '/assets/vfx/burn-out.png' },

  // NPC sprites.
  'sprite.npc.merchant': { kind: 'texture', url: '/assets/sprites/npc/merchant.png' },

  // M8 mob textures extracted from `02 Forest.png` showcase via rembg.
  'sprite.mob.berserkMouse': { kind: 'texture', url: '/assets/sprites/mobs/berserkMouse.png' },
  'sprite.mob.berserkMouse.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/berserkMouse-attack.png',
  },
  'sprite.mob.berserkMouse.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/berserkMouse-death.png',
  },
  'sprite.mob.goblin': { kind: 'texture', url: '/assets/sprites/mobs/goblin.png' },
  'sprite.mob.goblin.attack': { kind: 'texture', url: '/assets/sprites/mobs/goblin-attack.png' },
  'sprite.mob.goblin.death': { kind: 'texture', url: '/assets/sprites/mobs/goblin-death.png' },
  'sprite.mob.assassinCock': { kind: 'texture', url: '/assets/sprites/mobs/assassinCock.png' },
  'sprite.mob.assassinCock.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/assassinCock-attack.png',
  },
  'sprite.mob.assassinCock.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/assassinCock-death.png',
  },
  'sprite.mob.trent': { kind: 'texture', url: '/assets/sprites/mobs/trent.png' },
  'sprite.mob.trent.attack': { kind: 'texture', url: '/assets/sprites/mobs/trent-attack.png' },
  'sprite.mob.trent.death': { kind: 'texture', url: '/assets/sprites/mobs/trent-death.png' },

  // Bosses. Fruegel — single sprite, reused for idle / attack / death
  // poses until pose-specific variants get generated. Native size is
  // 152×199; MOBS.fruegel.sprite.width/height drive the on-screen
  // dimensions and the AI scales accordingly.
  'sprite.mob.fruegel': { kind: 'texture', url: '/assets/sprites/mobs/fruegel.png' },
  'sprite.mob.fruegel.attack': {
    kind: 'texture',
    url: '/assets/sprites/mobs/fruegel.png',
  },
  'sprite.mob.fruegel.death': {
    kind: 'texture',
    url: '/assets/sprites/mobs/fruegel.png',
  },

  // M8 forest tiles.
  // Ground = first Gemini grass variant (sampled into iso-diamond Graphics fills,
  // so its white bg is naturally clipped by the polygon shape).
  // Path = procedurally generated dirt texture (256x128, edge-to-edge, no border)
  // matching the TLoD `01.png` forest reference palette.
  'tile.forest.ground': { kind: 'texture', url: '/assets/tiles/forest/grass-procedural.png' },
  'tile.forest.path.1': { kind: 'texture', url: '/assets/tiles/forest/dirt-procedural.png' },

  // 16 tree variants (rows 1+2 of Gemini sheet B).
  'sprite.prop.tree.1': { kind: 'texture', url: '/assets/sprites/props/tree-01.png' },
  'sprite.prop.tree.2': { kind: 'texture', url: '/assets/sprites/props/tree-02.png' },
  'sprite.prop.tree.3': { kind: 'texture', url: '/assets/sprites/props/tree-03.png' },
  'sprite.prop.tree.4': { kind: 'texture', url: '/assets/sprites/props/tree-04.png' },
  'sprite.prop.tree.5': { kind: 'texture', url: '/assets/sprites/props/tree-05.png' },
  'sprite.prop.tree.6': { kind: 'texture', url: '/assets/sprites/props/tree-06.png' },
  'sprite.prop.tree.7': { kind: 'texture', url: '/assets/sprites/props/tree-07.png' },
  'sprite.prop.tree.8': { kind: 'texture', url: '/assets/sprites/props/tree-08.png' },
  'sprite.prop.tree.9': { kind: 'texture', url: '/assets/sprites/props/tree-09.png' },
  'sprite.prop.tree.10': { kind: 'texture', url: '/assets/sprites/props/tree-10.png' },
  'sprite.prop.tree.11': { kind: 'texture', url: '/assets/sprites/props/tree-11.png' },
  'sprite.prop.tree.12': { kind: 'texture', url: '/assets/sprites/props/tree-12.png' },
  'sprite.prop.tree.13': { kind: 'texture', url: '/assets/sprites/props/tree-13.png' },
  'sprite.prop.tree.14': { kind: 'texture', url: '/assets/sprites/props/tree-14.png' },
  'sprite.prop.tree.15': { kind: 'texture', url: '/assets/sprites/props/tree-15.png' },
  'sprite.prop.tree.16': { kind: 'texture', url: '/assets/sprites/props/tree-16.png' },
  // Cliff blocks (used as 'rock' props).
  'sprite.prop.rock.1': { kind: 'texture', url: '/assets/sprites/props/rock-01.png' },
  'sprite.prop.rock.2': { kind: 'texture', url: '/assets/sprites/props/rock-02.png' },
  'sprite.prop.rock.3': { kind: 'texture', url: '/assets/sprites/props/rock-03.png' },
  'sprite.prop.rock.4': { kind: 'texture', url: '/assets/sprites/props/rock-04.png' },
  // Gnarled props.
  'sprite.prop.log.1': { kind: 'texture', url: '/assets/sprites/props/log-01.png' },
  'sprite.prop.stump.1': { kind: 'texture', url: '/assets/sprites/props/stump-01.png' },
  'sprite.prop.branch.1': { kind: 'texture', url: '/assets/sprites/props/branch-01.png' },
  'sprite.prop.vine.1': { kind: 'texture', url: '/assets/sprites/props/vine-01.png' },
} as const satisfies Record<string, TextureAsset>;

export type AssetAlias = keyof typeof MANIFEST;

const TEXTURES = new Map<AssetAlias, Texture>();

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

export const AssetManager = {
  /** Preload every texture-kind asset so getTexture() can be called synchronously by RenderSystem. */
  async preload(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const alias of Object.keys(MANIFEST) as AssetAlias[]) {
      const asset = MANIFEST[alias];
      if (asset.kind === 'texture') {
        tasks.push(
          Assets.load(resolveAssetUrl(asset.url)).then((tex) => {
            const texture = tex as Texture;
            // Tile textures need REPEAT wrap so polygon-fill samples wrap across
            // the texture boundary (otherwise Pixi clamps to edge and we see seams
            // between adjacent iso diamonds). Sprite textures keep the default.
            if (alias.startsWith('tile.')) {
              texture.source.style.addressMode = 'repeat';
            }
            TEXTURES.set(alias, texture);
          }),
        );
      }
    }
    await Promise.all(tasks);
  },

  get(alias: AssetAlias): TextureAsset {
    const a = MANIFEST[alias];
    if (!a) throw new Error(`Unknown asset alias: ${alias}`);
    return a;
  },

  getTexture(alias: AssetAlias): Texture | null {
    return TEXTURES.get(alias) ?? null;
  },
} as const;
