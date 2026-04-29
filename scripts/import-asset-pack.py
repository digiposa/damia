"""Copies relevant PNGs from the itch.io Forest pack (Rafael Sewa, CC BY-NC-SA 4.0)
into `public/assets/` with our naming convention.

- 1 ForestGround    -> tile.forest.ground
- 16 Step           -> tile.forest.path.1..16
- 8 Tree (sampled)  -> sprite.prop.tree.1..8
- 6 Rock            -> sprite.prop.rock.1..6
- 6 Stump           -> sprite.prop.stump.1..6 (used for our 'roots' kind)
- 2 Log             -> sprite.prop.log.1..2

Re-run after updating the pack or the selection mappings.
"""

from pathlib import Path
import re
import shutil

REPO = Path(__file__).resolve().parent.parent
PACK = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "AssetPack01_Forest_Sample" / "02_Vanilla"
OUT_TILES = REPO / "public" / "assets" / "tiles" / "forest"
OUT_PROPS = REPO / "public" / "assets" / "sprites" / "props"


def discover(prefix: str) -> list[Path]:
    """Return sorted PNGs whose name (after the SA0200xxx_ id) starts with `prefix`."""
    pattern = re.compile(rf"^SA\d+_{prefix}\d*\.[Pp][Nn][Gg]$")
    return sorted(p for p in PACK.iterdir() if pattern.match(p.name))


def copy_one(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  {dst.relative_to(REPO)}  <-  {src.name}")


def main() -> None:
    if not PACK.is_dir():
        raise SystemExit(f"Asset pack not found at {PACK}")

    OUT_TILES.mkdir(parents=True, exist_ok=True)
    OUT_PROPS.mkdir(parents=True, exist_ok=True)

    # Ground (single seamless background).
    grounds = discover("ForestGround")
    if grounds:
        copy_one(grounds[0], OUT_TILES / "ground.png")

    # Path tiles — keep all 16 Step variants for visual variety.
    for i, src in enumerate(discover("Step"), start=1):
        copy_one(src, OUT_TILES / f"path-{i:02d}.png")

    # Trees — 52 available; sample 8 evenly so we don't over-bloat.
    trees = discover("Tree")
    if len(trees) >= 8:
        step = len(trees) // 8
        sampled = [trees[i * step] for i in range(8)]
    else:
        sampled = trees
    for i, src in enumerate(sampled, start=1):
        copy_one(src, OUT_PROPS / f"tree-{i:02d}.png")

    # Rocks, Stumps, Logs — copy all variants, use 1-based numbering.
    for category, prefix, name in [
        ("rock", "Rock", "rock"),
        ("stump", "Stump", "stump"),
        ("log", "Log", "log"),
    ]:
        for i, src in enumerate(discover(prefix), start=1):
            copy_one(src, OUT_PROPS / f"{name}-{i:02d}.png")


if __name__ == "__main__":
    main()
