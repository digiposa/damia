"""Auto-detect non-white sprite bounding boxes in a Gemini sheet.

Strategy: threshold the image to find non-white pixels, run scipy connected
components, output bounding boxes sorted top-to-bottom, left-to-right with a
preview overlay so we can pick the right indices.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "tiles" / "Gemini_Generated_Image_noetx3noetx3noet.png"
OUT = REPO / "scripts" / "debug" / "auto_detected.png"
DARK_THRESH = 90
MIN_AREA = 1500
DILATE_ITERS = 2


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    arr = np.array(img)
    # Mask: True = pixel has at least one dark channel (grid lines RGB ~200 are excluded).
    mask = (arr[..., 0] < DARK_THRESH) | (arr[..., 1] < DARK_THRESH) | (arr[..., 2] < DARK_THRESH)
    mask = ndimage.binary_dilation(mask, iterations=DILATE_ITERS)
    labels, n = ndimage.label(mask)
    print(f"Detected {n} connected components")

    boxes: list[tuple[int, int, int, int, int]] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labels == i)
        if len(xs) < MIN_AREA:
            continue
        x0, x1 = int(xs.min()), int(xs.max())
        y0, y1 = int(ys.min()), int(ys.max())
        boxes.append((y0, x0, y1, x1, len(xs)))

    boxes.sort(key=lambda b: (b[0] // 50, b[1]))  # top-down then left-right
    print(f"Kept {len(boxes)} bboxes (area >= {MIN_AREA}):")
    for idx, (y0, x0, y1, x1, area) in enumerate(boxes):
        print(f"  #{idx:2d}: ({x0:4d}, {y0:4d}, {x1:4d}, {y1:4d})  {x1-x0}x{y1-y0}  area={area}")

    # Preview: draw boxes + indices on the source image.
    preview = img.convert("RGBA").copy()
    draw = ImageDraw.Draw(preview)
    font = ImageFont.load_default()
    for idx, (y0, x0, y1, x1, _) in enumerate(boxes):
        draw.rectangle([(x0, y0), (x1, y1)], outline=(255, 255, 0, 255), width=2)
        draw.text((x0 + 4, y0 + 2), f"#{idx}", fill=(255, 0, 0, 255), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    preview.save(OUT)
    print(f"\npreview: {OUT}")


if __name__ == "__main__":
    main()
