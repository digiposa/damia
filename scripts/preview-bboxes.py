"""Renders the planned crop bboxes onto the source image as a debug preview.
Run this BEFORE extract-assets.py to verify each rect lands on the right thing.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "all" / "02 Forest.png"
OUT = REPO / "scripts" / "debug" / "bbox_preview.png"

# Edit these to iterate. Format: name -> (left, top, right, bottom).
BBOXES = {
    # Mobs — tightened on body, labels excluded.
    "berserkMouse": (700, 1130, 805, 1230),
    "goblin":       (850, 1130, 985, 1230),
    "assassinCock": (640, 870, 870, 1080),
    "trent":        (1050, 990, 1230, 1235),
    # Tiles — square patches from texture-rich ground areas.
    "tile.grass":   (20, 840, 220, 1040),
    "tile.dirt":    (120, 230, 320, 380),
}

COLORS = {
    "berserkMouse": (255, 80, 200),
    "goblin": (80, 255, 120),
    "assassinCock": (200, 100, 255),
    "trent": (255, 220, 80),
    "tile.grass": (255, 255, 255),
    "tile.dirt": (255, 200, 100),
}


def main() -> None:
    img = Image.open(SRC).convert("RGBA").copy()
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    for name, bbox in BBOXES.items():
        c = COLORS[name]
        draw.rectangle(bbox, outline=c + (255,), width=4)
        draw.text((bbox[0] + 4, bbox[1] - 18), name, fill=c + (255,), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
