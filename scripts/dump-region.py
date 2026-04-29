"""Dump a region at native resolution with a 50px grid + axis labels — for
identifying exact pixel positions of subjects."""

from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "all" / "02 Forest.png"

# (left, top, right, bottom) of the source region to dump.
REGION = (570, 800, 1230, 1230)
GRID = 50
OUT = REPO / "scripts" / "debug" / "region.png"


def main() -> None:
    img = Image.open(SRC).convert("RGBA").crop(REGION).copy()
    w, h = img.size
    ox, oy = REGION[0], REGION[1]
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    for x in range(0, w, GRID):
        col = (255, 255, 0, 70) if (x + ox) % 100 else (255, 255, 0, 130)
        draw.line([(x, 0), (x, h)], fill=col, width=1)
        if (x + ox) % 100 == 0:
            draw.text((x + 1, 1), str(x + ox), fill=(255, 255, 0, 255), font=font)
    for y in range(0, h, GRID):
        col = (255, 255, 0, 70) if (y + oy) % 100 else (255, 255, 0, 130)
        draw.line([(0, y), (w, y)], fill=col, width=1)
        if (y + oy) % 100 == 0:
            draw.text((1, y + 1), str(y + oy), fill=(255, 255, 0, 255), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT} ({w}x{h}, source origin ({ox},{oy}))", file=sys.stderr)


if __name__ == "__main__":
    main()
