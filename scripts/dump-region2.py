"""Dump just the props/cliff region of Sheet B to verify y coords."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "maps" / "02_forest" / "tiles" / "Gemini_Generated_Image_noetx3noetx3noet.png"
OUT = REPO / "scripts" / "debug" / "props_cliff_strip.png"

# Bottom region: gnarled props + cliff blocks (skip the trees and UI).
REGION = (0, 600, 912, 1100)
GRID = 25


def main() -> None:
    img = Image.open(SRC).convert("RGBA").crop(REGION)
    w, h = img.size
    ox, oy = REGION[0], REGION[1]
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    for x in range(0, w, GRID):
        col = (255, 255, 0, 200) if (x + ox) % 100 == 0 else (255, 255, 0, 80)
        draw.line([(x, 0), (x, h)], fill=col, width=1)
        if (x + ox) % 100 == 0:
            draw.text((x + 1, 1), str(x + ox), fill=(255, 255, 0, 255), font=font)
    for y in range(0, h, GRID):
        col = (255, 255, 0, 200) if (y + oy) % 100 == 0 else (255, 255, 0, 80)
        draw.line([(0, y), (w, y)], fill=col, width=1)
        if (y + oy) % 100 == 0:
            draw.text((1, y + 1), str(y + oy), fill=(255, 255, 0, 255), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT} ({w}x{h}, origin ({ox},{oy}))")


if __name__ == "__main__":
    main()
