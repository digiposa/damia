"""Generic sprite matter: takes a single PNG with a uniform near-black/navy bg,
removes the bg with morphological closing to keep dark internal shadows, writes
the result to a target path. Usage:

  python scripts/matte-sprite.py <src.png> <dst.png>
"""
from pathlib import Path
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

BG_DIST_THRESH = 35.0
ERODE_ITERS = 1
CLOSE_ITERS = 6


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])

    img = Image.open(src).convert("RGBA")
    arr = np.array(img)
    rgb = arr[..., :3].astype(np.int32)

    # Sample bg from corners (assume uniform).
    corners = np.concatenate(
        [rgb[:8, :8].reshape(-1, 3),
         rgb[:8, -8:].reshape(-1, 3),
         rgb[-8:, :8].reshape(-1, 3),
         rgb[-8:, -8:].reshape(-1, 3)]
    )
    bg = np.median(corners, axis=0).astype(np.int32)
    print(f"bg color: rgb{tuple(bg)}")

    diff = rgb - bg
    dist = np.sqrt((diff ** 2).sum(axis=-1))
    mask = dist > BG_DIST_THRESH
    if ERODE_ITERS:
        mask = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    mask = ndimage.binary_closing(mask, iterations=CLOSE_ITERS)

    alpha = (mask.astype(np.uint8) * 255)
    rgba = np.concatenate([arr[..., :3], alpha[..., None]], axis=-1)
    out = Image.fromarray(rgba, "RGBA")

    bbox = out.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 2
        out = out.crop((max(0, x0 - pad), max(0, y0 - pad),
                        min(out.size[0], x1 + pad), min(out.size[1], y1 + pad)))

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    print(f"wrote {dst}  size={out.size}")


if __name__ == "__main__":
    main()
