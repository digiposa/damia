"""Auto-detect every mini-sprite in a Dart Gemini sheet and dump them all.
Skips the central hero shot (too big). Useful to identify walk frames.
"""
from pathlib import Path
import sys
from io import BytesIO
import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else (
    REPO / "shareAI" / "assetsTLOD" / "characters" / "Dart" / "Gemini_Generated_Image_jau5sfjau5sfjau5.png"
)
OUT_DIR = REPO / "scripts" / "debug" / "dart_minis"

DARK_THRESH = 90
ERODE_ITERS = 2
MIN_AREA = 8000     # filter out tiny noise blobs
MAX_AREA = 90000    # filter out the central hero shot


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    rgb = np.array(img.convert("RGB"))
    mask = (rgb[..., 0] < DARK_THRESH) | (rgb[..., 1] < DARK_THRESH) | (rgb[..., 2] < DARK_THRESH)
    mask = ndimage.binary_erosion(mask, iterations=ERODE_ITERS)
    labels, n = ndimage.label(mask)

    boxes: list[tuple[int, int, int, int]] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labels == i)
        area = len(xs)
        if area < MIN_AREA or area > MAX_AREA:
            continue
        boxes.append((int(ys.min()), int(xs.min()), int(ys.max()), int(xs.max())))
    boxes.sort(key=lambda b: (b[0] // 80, b[1]))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Detected {len(boxes)} mini-sprites.")

    session = new_session("isnet-general-use")
    for idx, (y0, x0, y1, x1) in enumerate(boxes, start=1):
        pad = 6
        bx = (max(0, x0 - pad), max(0, y0 - pad), x1 + pad, y1 + pad)
        sub = img.crop(bx)
        buf = BytesIO()
        sub.save(buf, format="PNG")
        out = remove(buf.getvalue(), session=session)
        result = Image.open(BytesIO(out)).convert("RGBA")
        bb = result.getbbox()
        if bb:
            result = result.crop(bb)
        result.save(OUT_DIR / f"dart-mini-{idx:02d}.png")
        print(f"  dart-mini-{idx:02d}  bbox={bx}  size={result.size}")


if __name__ == "__main__":
    main()
