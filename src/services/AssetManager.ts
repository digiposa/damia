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
}

const MANIFEST = {
  // Dart sprite (M8) — central hero shot extracted from `jau5sf...png` via rembg.
  // `autoTrim` on every pose so feet land on the tile floor consistently
  // regardless of per-pose canvas padding (the poses were sliced from a
  // sprite sheet and each has slightly different transparent margins).
  'sprite.player.dart': {
    kind: 'texture',
    url: '/assets/sprites/player/dart.png',
    autoTrim: true,
  },
  // Attack pose used during AttackSwing — dynamic two-handed combat stance.
  // Static fallback for the Sprite.attackTextureAlias field; the live
  // 3-frame sequence below drives the actual swing animation via RenderSystem
  // when DART.sprite.base.attackFrames is declared.
  'sprite.player.dart.attack': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack.png',
    autoTrim: true,
  },
  // 3-frame basic-attack animation (wind-up → strike → follow-through).
  // RenderSystem splits AttackSwing duration evenly across the array.
  'sprite.player.dart.attack.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-1.png',
    autoTrim: true,
  },
  'sprite.player.dart.attack.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-2.png',
    autoTrim: true,
  },
  'sprite.player.dart.attack.3': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-attack-3.png',
    autoTrim: true,
  },
  // 2-frame walk cycle. RenderSystem swaps between them while the entity
  // has active Pathfinder waypoints (and no swing / addition / spell /
  // defend taking over). Cycle period is fixed; a per-entity phase
  // offset desyncs swarms so they don't step in lockstep.
  'sprite.player.dart.walk.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-walk-1.png',
    autoTrim: true,
  },
  'sprite.player.dart.walk.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-walk-2.png',
    autoTrim: true,
  },
  // Defend pose held while the Defending component is present.
  'sprite.player.dart.defend': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-defend.png',
    autoTrim: true,
  },
  // Double Slash addition — 2-frame follow-up after the basic 3-frame
  // swing (wind-up across body → horizontal arc with VFX trail). Combined
  // with the basic attackFrames in DART.sprite.base.additions.doubleSlash
  // to render the full "double slash" sequence in a single Addition tick.
  'sprite.player.dart.doubleSlash.1': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-double-slash-1.png',
    autoTrim: true,
  },
  'sprite.player.dart.doubleSlash.2': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-double-slash-2.png',
    autoTrim: true,
  },
  // Red-Eye Dragoon form — single pose reused for idle / attack /
  // defend until pose variants exist.
  'sprite.player.dart.dragoon': {
    kind: 'texture',
    url: '/assets/sprites/player/dart-dragoon.png',
    autoTrim: true,
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
  // 'map.forest.survival': { kind: 'texture', url: '/assets/maps/forest-survival.png' },

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

export const AssetManager = {
  /** Preload every texture-kind asset so getTexture() can be called synchronously by RenderSystem. */
  async preload(): Promise<void> {
    const tasks: Array<Promise<void>> = [];
    for (const alias of Object.keys(MANIFEST) as AssetAlias[]) {
      // Widen the literal-narrowed union from `as const satisfies` so
      // optional fields like `autoTrim` (only declared on some entries)
      // are visible without per-key type-guards.
      const asset = MANIFEST[alias] as TextureAsset;
      if (asset.kind === 'texture') {
        const resolvedUrl = resolveAssetUrl(asset.url);
        tasks.push(
          Assets.load(resolvedUrl).then(async (tex) => {
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
