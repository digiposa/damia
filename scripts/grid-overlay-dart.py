"""Grid overlay on the jau5sf Dart sheet to identify mini-sprite bboxes."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "characters" / "Dart" / "Gemini_Generated_Image_jau5sfjau5sfjau5.png"
OUT = REPO / "scripts" / "debug" / "grid_dart_jau5sf.png"
GRID = 50


def main() -> None:
    img = Image.open(SRC).convert("RGBA").copy()
    w, h = img.size
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    for x in range(0, w, GRID):
        col = (255, 255, 0, 200) if x % 100 == 0 else (255, 255, 0, 80)
        draw.line([(x, 0), (x, h)], fill=col, width=1)
        if x % 100 == 0:
            draw.text((x + 1, 1), str(x), fill=(255, 255, 0, 255), font=font)
    for y in range(0, h, GRID):
        col = (255, 255, 0, 200) if y % 100 == 0 else (255, 255, 0, 80)
        draw.line([(0, y), (w, y)], fill=col, width=1)
        if y % 100 == 0:
            draw.text((1, y + 1), str(y), fill=(255, 255, 0, 255), font=font)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"wrote {OUT} ({w}x{h})")


if __name__ == "__main__":
    main()
