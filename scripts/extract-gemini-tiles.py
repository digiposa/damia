"""Auto-detects iso diamond tiles in the Gemini-generated tile sheet
(`Gemini_Generated_Image_6bos3y...png`, 1408x768) and writes each to
public/assets/tiles/forest/.

Strategy: dark-pixel connected components on the (mostly transparent/white)
sheet. Each iso diamond is one component. We sort top-down then left-right and
classify by row index → grass / transition / dirt.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "tiles" / "Gemini_Generated_Image_6bos3y6bos3y6bos.png"
OUT = REPO / "public" / "assets" / "tiles" / "forest"

DARK_THRESH = 90
ERODE_ITERS = 2  # break thin visual connections between adjacent tiles
DILATE_ITERS = 0
MIN_AREA = 8000


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img)
    rgb = arr[..., :3]
    # Subject = pixel with at least one channel below threshold (drops white/transparent bg).
    mask = (rgb[..., 0] < DARK_THRESH) | (rgb[..., 1] < DARK_THRESH) | (rgb[..., 2] < DARK_THRESH)
    if ERODE_ITERS:
        mask = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    if DILATE_ITERS:
        mask = ndimage.binary_dilation(mask, iterations=DILATE_ITERS)
    labels, n = ndimage.label(mask)

    # Collect bboxes that are likely tiles.
    boxes: list[tuple[int, int, int, int]] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labels == i)
        if len(xs) < MIN_AREA:
            continue
        boxes.append((int(ys.min()), int(xs.min()), int(ys.max()), int(xs.max())))

    # Sort by row band (50px tolerance) then left-right.
    boxes.sort(key=lambda b: (b[0] // 80, b[1]))
    print(f"Detected {len(boxes)} tiles.")

    OUT.mkdir(parents=True, exist_ok=True)
    # Group by approximate row to assign category names.
    rows: list[list[tuple[int, int, int, int]]] = []
    current_row: list[tuple[int, int, int, int]] = []
    last_y = -1000
    for box in boxes:
        if box[0] - last_y > 80:
            if current_row:
                rows.append(current_row)
            current_row = [box]
        else:
            current_row.append(box)
        last_y = box[0]
    if current_row:
        rows.append(current_row)

    # Categorise — heuristic: top half rows = grass, middle = transition, bottom = dirt.
    grass: list[tuple[int, int, int, int]] = []
    transition: list[tuple[int, int, int, int]] = []
    dirt: list[tuple[int, int, int, int]] = []
    n_rows = len(rows)
    for r_idx, row in enumerate(rows):
        if r_idx < n_rows // 2:
            grass.extend(row)
        elif r_idx == n_rows // 2:
            transition.extend(row)
        else:
            dirt.extend(row)

    print(f"  rows={n_rows}  grass={len(grass)}  transition={len(transition)}  dirt={len(dirt)}")

    def crop(box: tuple[int, int, int, int]) -> Image.Image:
        y0, x0, y1, x1 = box
        pad = 4
        return img.crop((max(0, x0 - pad), max(0, y0 - pad), x1 + pad, y1 + pad))

    for i, box in enumerate(grass, start=1):
        crop(box).save(OUT / f"grass-{i:02d}.png")
        print(f"  grass-{i:02d}.png  bbox={box}")
    for i, box in enumerate(transition, start=1):
        crop(box).save(OUT / f"transition-{i:02d}.png")
        print(f"  transition-{i:02d}.png  bbox={box}")
    for i, box in enumerate(dirt, start=1):
        crop(box).save(OUT / f"dirt-{i:02d}.png")
        print(f"  dirt-{i:02d}.png  bbox={box}")


if __name__ == "__main__":
    main()
