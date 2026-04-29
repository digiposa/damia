"""Extracts mob sprites and ground tiles from the TLoD reference pack.

- Mob sprites: cropped from the showcase area of `02 Forest.png`, then matted
  against the (near-black) background. Output: PNG with anti-aliased alpha.
- Ground tiles: opaque square patches from the same sheet's screenshots.
  These are texture sources that the iso TileMap fills its diamonds with.

Reproducible: re-run after tweaking BBOXES to refine crops.
"""

from pathlib import Path
from io import BytesIO
from PIL import Image
from rembg import new_session, remove

REPO = Path(__file__).resolve().parent.parent
SRC_FOREST = REPO / "shareAI" / "assetsTLOD" / "all" / "02 Forest.png"
OUT_MOBS = REPO / "public" / "assets" / "sprites" / "mobs"
OUT_TILES = REPO / "public" / "assets" / "tiles" / "forest"

# (left, top, right, bottom) — tightened from the grid_02 Forest.png debug overlay.
MOB_BBOXES = {
    # Padded a bit so rembg has more context around each subject.
    # Trent's bottom trimmed to drop the "Trent" label.
    "berserkMouse": (550, 1070, 720, 1200),
    "goblin":       (730, 1040, 910, 1200),
    "assassinCock": (550, 800, 760, 960),
    "trent":        (1010, 820, 1200, 1175),
}

TILE_BBOXES = {
    "grass": (20, 840, 220, 1040),
    "dirt":  (120, 230, 320, 380),
}


_REMBG_SESSION = None


def _session():
    global _REMBG_SESSION
    if _REMBG_SESSION is None:
        # u2net_human_seg is for people; isnet-general-use is the strongest general model.
        _REMBG_SESSION = new_session("isnet-general-use")
    return _REMBG_SESSION


def matte(image: Image.Image) -> Image.Image:
    """AI background removal via rembg (isnet-general-use) with alpha-matting
    refinement for cleaner edges on low-contrast subjects. Crops to content bbox."""
    rgba = image.convert("RGBA")
    buf = BytesIO()
    rgba.save(buf, format="PNG")
    # alpha_matting helps clean edges but on the TLoD showcase it eats the
    # low-contrast subjects (Goblin, Mouse). Plain remove() gives the best results.
    out_bytes = remove(buf.getvalue(), session=_session())
    out = Image.open(BytesIO(out_bytes)).convert("RGBA")
    bbox = out.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 2
        bbox = (
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(out.size[0], x1 + pad),
            min(out.size[1], y1 + pad),
        )
        out = out.crop(bbox)
    return out


def extract_mobs(src: Image.Image) -> None:
    OUT_MOBS.mkdir(parents=True, exist_ok=True)
    for name, bbox in MOB_BBOXES.items():
        sub = src.crop(bbox)
        matted = matte(sub)
        out_path = OUT_MOBS / f"{name}.png"
        matted.save(out_path)
        print(f"  mob {name:14s} {bbox} -> {out_path.relative_to(REPO)} ({matted.size[0]}x{matted.size[1]})")


def extract_tiles(src: Image.Image) -> None:
    OUT_TILES.mkdir(parents=True, exist_ok=True)
    for name, bbox in TILE_BBOXES.items():
        sub = src.crop(bbox).convert("RGB")
        out_path = OUT_TILES / f"{name}.png"
        sub.save(out_path)
        print(f"  tile {name:14s} {bbox} -> {out_path.relative_to(REPO)} ({sub.size[0]}x{sub.size[1]})")


def main() -> None:
    print(f"Loading {SRC_FOREST.name}...")
    src = Image.open(SRC_FOREST)
    print(f"  source: {src.size[0]}x{src.size[1]}")
    print("Extracting mob sprites:")
    extract_mobs(src)
    print("Extracting ground tiles:")
    extract_tiles(src)
    print("Done.")


if __name__ == "__main__":
    main()
