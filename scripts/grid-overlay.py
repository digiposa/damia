"""Generates a debug version of source images with a 100px grid + coord labels.
Useful to identify exact pixel bounding boxes for the extractor.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC_DIR = REPO / "shareAI" / "assetsTLOD" / "all"
OUT_DIR = REPO / "scripts" / "debug"
OUT_DIR.mkdir(parents=True, exist_ok=True)

GRID = 100
LABEL_COLOR = (255, 255, 0, 255)
LINE_COLOR = (255, 255, 0, 96)


def overlay(filename: str) -> None:
    src = Image.open(SRC_DIR / filename).convert("RGBA")
    w, h = src.size
    out = src.copy()
    draw = ImageDraw.Draw(out)
    font = ImageFont.load_default()
    for x in range(0, w, GRID):
        draw.line([(x, 0), (x, h)], fill=LINE_COLOR, width=1)
        draw.text((x + 2, 2), str(x), fill=LABEL_COLOR, font=font)
    for y in range(0, h, GRID):
        draw.line([(0, y), (w, y)], fill=LINE_COLOR, width=1)
        draw.text((2, y + 2), str(y), fill=LABEL_COLOR, font=font)
    out.save(OUT_DIR / f"grid_{filename}")
    print(f"wrote {OUT_DIR / f'grid_{filename}'} ({w}x{h})")


if __name__ == "__main__":
    overlay("02 Forest.png")
