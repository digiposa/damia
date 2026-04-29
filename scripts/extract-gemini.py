"""Final extractor for the two Gemini sheets.

Sheet A (`okvehyokvehyokve.png`, 1440x720):
  - Manually-coded tile bboxes (top-left ground pattern + 8 path tiles).

Sheet B (`noetx3...png`, 912x1163):
  - Bounding boxes auto-detected via dark-pixel connected components.
  - 16 trees (rows 1-2), 4 gnarled props (logs/branch/roots/vines), 4 cliffs.
  - White-BG removal via simple per-pixel threshold + Gaussian alpha softening
    (cleaner than rembg on the pale-foliage trees Gemini produces).

Re-run after editing bbox tables. Tiles save opaque, sprites save with alpha.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parent.parent
SRC_TILES = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "tiles" / "Gemini_Generated_Image_okvehyokvehyokve.png"
SRC_TREES = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "tiles" / "Gemini_Generated_Image_noetx3noetx3noet.png"
OUT_TILES = REPO / "public" / "assets" / "tiles" / "forest"
OUT_PROPS = REPO / "public" / "assets" / "sprites" / "props"

# Sheet A: opaque tile crops (no matting — used as iso fills).
SHEET_A_TILES: dict[str, tuple[int, int, int, int]] = {
    "ground":  (40, 40, 200, 200),
    "path-01": (400, 30, 555, 150),
    "path-02": (565, 30, 720, 150),
    "path-03": (725, 30, 880, 150),
    "path-04": (890, 30, 1045, 150),
    "path-05": (475, 150, 630, 270),
    "path-06": (640, 150, 795, 270),
    "path-07": (805, 150, 960, 270),
    "path-08": (965, 150, 1120, 270),
}

# Sheet B: bboxes captured from auto-detect.py output.
SHEET_B_SPRITES: dict[str, tuple[int, int, int, int]] = {
    # Trees row 1 (y ~37-186)
    "tree-01": (6, 37, 130, 186),
    "tree-02": (140, 42, 227, 182),
    "tree-03": (239, 40, 342, 183),
    "tree-04": (352, 39, 456, 183),
    "tree-05": (464, 38, 560, 182),
    "tree-06": (569, 40, 673, 184),
    "tree-07": (685, 43, 771, 182),
    "tree-08": (781, 38, 905, 186),
    # Trees row 2 (y ~211-364)
    "tree-09": (11, 211, 135, 364),
    "tree-10": (140, 215, 229, 361),
    "tree-11": (241, 215, 345, 362),
    "tree-12": (354, 213, 450, 361),
    "tree-13": (461, 216, 565, 361),
    "tree-14": (571, 214, 674, 362),
    "tree-15": (688, 218, 774, 362),
    "tree-16": (783, 212, 905, 362),
    # Gnarled props (y ~420-599)
    "log-01":     (23, 426, 200, 533),
    "branch-01":  (232, 422, 472, 597),
    "stump-01":   (476, 420, 699, 599),
    "vine-01":    (731, 420, 885, 580),
    # Cliff blocks (y ~643-877)
    "rock-01":    (22, 654, 230, 859),
    "rock-02":    (253, 653, 424, 860),
    "rock-03":    (441, 643, 684, 877),
    "rock-04":    (703, 664, 895, 831),
}

WHITE_THRESH = 215
ALPHA_BLUR_RADIUS = 0.7


def matte_white_bg(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[..., :3]
    is_fg = (rgb[..., 0] < WHITE_THRESH) | (rgb[..., 1] < WHITE_THRESH) | (rgb[..., 2] < WHITE_THRESH)
    alpha = (is_fg.astype(np.uint8)) * 255
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(ALPHA_BLUR_RADIUS))
    out = Image.merge("RGBA", (*rgba.split()[:3], alpha_img))
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


def main() -> None:
    OUT_TILES.mkdir(parents=True, exist_ok=True)
    OUT_PROPS.mkdir(parents=True, exist_ok=True)

    print(f"Sheet A: {SRC_TILES.name}")
    sheet_a = Image.open(SRC_TILES)
    for name, bbox in SHEET_A_TILES.items():
        sub = sheet_a.crop(bbox).convert("RGB")
        out = OUT_TILES / f"{name}.png"
        sub.save(out)
        print(f"  tile  {name:10s} {bbox} -> {out.relative_to(REPO)} ({sub.size[0]}x{sub.size[1]})")

    print(f"\nSheet B: {SRC_TREES.name}")
    sheet_b = Image.open(SRC_TREES)
    for name, bbox in SHEET_B_SPRITES.items():
        sub = sheet_b.crop(bbox)
        matted = matte_white_bg(sub)
        out = OUT_PROPS / f"{name}.png"
        matted.save(out)
        print(f"  prop  {name:10s} {bbox} -> {out.relative_to(REPO)} ({matted.size[0]}x{matted.size[1]})")


if __name__ == "__main__":
    main()
