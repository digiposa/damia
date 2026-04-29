"""Dump just the showcase strip of 02 Forest.png at native resolution with a fine
25px grid so I can read exact mob positions."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "all" / "02 Forest.png"
OUT = REPO / "scripts" / "debug" / "showcase_strip.png"

# Showcase area covers roughly the right-bottom region of the sheet.
STRIP = (530, 800, 1233, 1320)
GRID = 25


def main() -> None:
    img = Image.open(SRC).convert("RGBA").crop(STRIP)
    w, h = img.size
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    # Coordinates shown are RELATIVE to the strip top-left so they match what we'd use
    # with crop(STRIP) — but I want absolute source coords, so add STRIP origin.
    ox, oy = STRIP[0], STRIP[1]
    for x in range(0, w, GRID):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 0, 80), width=1)
        if x % 100 == 0:
            draw.text((x + 1, 1), str(x + ox), fill=(255, 255, 0, 255), font=font)
    for y in range(0, h, GRID):
        draw.line([(0, y), (w, y)], fill=(255, 255, 0, 80), width=1)
        if y % 100 == 0:
            draw.text((1, y + 1), str(y + oy), fill=(255, 255, 0, 255), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT} ({w}x{h}, source origin at ({ox},{oy}))")


if __name__ == "__main__":
    main()
