"""Extract the central hero shot of Dart from the Gemini character sheet
(`jau5sf...png`) via rembg, plus copy the portrait file.
"""
from pathlib import Path
from io import BytesIO
import shutil
from PIL import Image
from rembg import new_session, remove

REPO = Path(__file__).resolve().parent.parent
SRC_HERO = REPO / "shareAI" / "assetsTLOD" / "characters" / "Dart" / "Gemini_Generated_Image_jau5sfjau5sfjau5.png"
SRC_PORTRAIT = REPO / "shareAI" / "assetsTLOD" / "characters" / "Dart" / "Dart_portrait.png"
OUT_HERO = REPO / "public" / "assets" / "sprites" / "player" / "dart.png"
OUT_PORTRAIT = REPO / "public" / "assets" / "ui" / "dart-portrait.png"

# Generous central crop covering the hero shot. rembg + alpha bbox trim handle the rest.
HERO_BBOX = (430, 30, 940, 720)


def main() -> None:
    OUT_HERO.parent.mkdir(parents=True, exist_ok=True)
    OUT_PORTRAIT.parent.mkdir(parents=True, exist_ok=True)

    # Portrait: copy as-is (already a tight portrait crop, RGB).
    shutil.copy2(SRC_PORTRAIT, OUT_PORTRAIT)
    print(f"  portrait -> {OUT_PORTRAIT.relative_to(REPO)}")

    # Hero: crop the central Dart, run rembg, trim to alpha bbox.
    sheet = Image.open(SRC_HERO).convert("RGBA")
    sub = sheet.crop(HERO_BBOX)
    buf = BytesIO()
    sub.save(buf, format="PNG")
    session = new_session("isnet-general-use")
    out_bytes = remove(buf.getvalue(), session=session)
    out = Image.open(BytesIO(out_bytes)).convert("RGBA")
    bbox = out.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 4
        bbox = (
            max(0, x0 - pad),
            max(0, y0 - pad),
            min(out.size[0], x1 + pad),
            min(out.size[1], y1 + pad),
        )
        out = out.crop(bbox)
    out.save(OUT_HERO)
    print(f"  hero     -> {OUT_HERO.relative_to(REPO)}  ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
