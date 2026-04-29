"""Extract a single idle goblin sprite from the Gemini sheet
(`gobelin_full.png`, 1080×1080 — 18 poses + 3 ground states).

Strategy: auto-detect dark connected components, sort by row/col, pick the
first sprite of row 1 (canonical idle facing front-left). Apply rembg matting
to the cropped region for clean alpha.
"""
from pathlib import Path
from io import BytesIO
import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "characters" / "monsters" / "gobelin" / "gobelin_full.png"
OUT = REPO / "public" / "assets" / "sprites" / "mobs" / "goblin.png"

DARK_THRESH = 90
ERODE_ITERS = 1
MIN_AREA = 5000


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img.convert("RGB"))
    mask = (arr[..., 0] < DARK_THRESH) | (arr[..., 1] < DARK_THRESH) | (arr[..., 2] < DARK_THRESH)
    mask = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    labels, n = ndimage.label(mask)

    boxes: list[tuple[int, int, int, int]] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labels == i)
        if len(xs) < MIN_AREA:
            continue
        boxes.append((int(ys.min()), int(xs.min()), int(ys.max()), int(xs.max())))
    boxes.sort(key=lambda b: (b[0] // 80, b[1]))
    print(f"Detected {len(boxes)} sprites; picking first.")

    if not boxes:
        raise SystemExit("no sprites detected")

    y0, x0, y1, x1 = boxes[0]
    pad = 6
    bbox = (max(0, x0 - pad), max(0, y0 - pad), x1 + pad, y1 + pad)
    sub = img.crop(bbox)

    # rembg matting: source bg is uniform mid-grey, isnet handles it well.
    buf = BytesIO()
    sub.save(buf, format="PNG")
    out_bytes = remove(buf.getvalue(), session=new_session("isnet-general-use"))
    out = Image.open(BytesIO(out_bytes)).convert("RGBA")
    bb = out.getbbox()
    if bb:
        x0, y0, x1, y1 = bb
        out = out.crop((max(0, x0 - 2), max(0, y0 - 2), min(out.size[0], x1 + 2), min(out.size[1], y1 + 2)))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT)
    print(f"  goblin -> {OUT.relative_to(REPO)}  ({out.size[0]}x{out.size[1]})  sourceBbox={bbox}")


if __name__ == "__main__":
    main()
