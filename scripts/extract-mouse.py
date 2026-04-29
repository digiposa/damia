"""Auto-detect every Berserk Mouse sprite in the Gemini sheet
(`sprites_full_berserkMouse.png`, 1080×1080, dark navy bg).

Approach: distance-from-bg-color threshold + connected components, then sort
top-down/left-right and dump each sprite. The first IDLE sprite (top-left) also
overwrites the engine's `public/assets/sprites/mobs/berserkMouse.png`.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "characters" / "monsters" / "berserkMouse" / "sprites_full_berserkMouse.png"
OUT_DIR = REPO / "public" / "assets" / "sprites" / "mobs"
OUT_MAIN = OUT_DIR / "berserkMouse.png"
OUT_FRAMES_DIR = OUT_DIR / "berserkMouse"

BG_DIST_THRESH = 35.0       # color distance from sampled bg
ERODE_ITERS = 2
MIN_AREA = 2500


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img)
    rgb = arr[..., :3].astype(np.int32)

    # The sheet has a WHITE outer margin AND a DARK navy inner area where the
    # sprites are placed. Find the inner dark bg by scanning inward and sample
    # several non-sprite cells inside it.
    h, w = rgb.shape[:2]
    inner = rgb[h // 4:3 * h // 4, w // 4:3 * w // 4]
    flat = inner.reshape(-1, 3)
    # Take pixels darker than mid-grey (likely bg, not sprite).
    dark = flat[(flat.sum(axis=-1) < 60)]
    if len(dark) == 0:
        raise SystemExit("could not find inner dark bg")
    bg = np.median(dark, axis=0).astype(np.int32)
    print(f"Sampled bg color: rgb{tuple(bg)}")

    # Treat any near-white pixel as "non-sprite" too (outer margin).
    near_white = rgb.sum(axis=-1) > 720

    # Foreground mask = pixels far from bg AND not near-white margin.
    diff = rgb - bg
    dist = np.sqrt((diff ** 2).sum(axis=-1))
    mask = (dist > BG_DIST_THRESH) & (~near_white)
    if ERODE_ITERS:
        mask = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    labels, n = ndimage.label(mask)

    boxes: list[tuple[int, int, int, int]] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labels == i)
        if len(xs) < MIN_AREA:
            continue
        boxes.append((int(ys.min()), int(xs.min()), int(ys.max()), int(xs.max())))
    # Sort top-down (row band 80px) then left-right.
    boxes.sort(key=lambda b: (b[0] // 80, b[1]))
    print(f"Detected {len(boxes)} sprites.")

    OUT_FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    # Build a SOLID alpha for each frame: take the foreground mask, run
    # morphological closing (dilate→erode) to fill internal dark shadows that
    # would otherwise appear transparent, then use that as a binary alpha.
    closed_mask = ndimage.binary_closing(mask, iterations=6)

    for idx, (y0, x0, y1, x1) in enumerate(boxes, start=1):
        pad = 4
        bx = (max(0, x0 - pad), max(0, y0 - pad), min(arr.shape[1], x1 + pad), min(arr.shape[0], y1 + pad))
        sub_rgb = arr[bx[1]:bx[3], bx[0]:bx[2], :3]
        sub_mask = closed_mask[bx[1]:bx[3], bx[0]:bx[2]]
        alpha = (sub_mask.astype(np.uint8) * 255)
        sub_rgba = np.concatenate([sub_rgb.astype(np.uint8), alpha[..., None]], axis=-1)
        out = Image.fromarray(sub_rgba, "RGBA")
        out.save(OUT_FRAMES_DIR / f"frame-{idx:02d}.png")
        if idx == 1:
            out.save(OUT_MAIN)
            print(f"  frame-01 (idle) -> {OUT_MAIN.relative_to(REPO)}")
        print(f"  frame-{idx:02d}  bbox={bx}  size={out.size}")


if __name__ == "__main__":
    main()
