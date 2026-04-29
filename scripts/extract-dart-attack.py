"""Extract the central attack pose of Dart from the htn4pr Gemini sheet."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from rembg import new_session, remove

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "characters" / "Dart" / "Gemini_Generated_Image_htn4prhtn4prhtn4.png"
OUT = REPO / "public" / "assets" / "sprites" / "player" / "dart-attack.png"

# Generous central crop; rembg + getbbox trim the rest.
HERO_BBOX = (430, 20, 970, 730)


def main() -> None:
    sheet = Image.open(SRC).convert("RGBA")
    sub = sheet.crop(HERO_BBOX)
    buf = BytesIO()
    sub.save(buf, format="PNG")
    out_bytes = remove(buf.getvalue(), session=new_session("isnet-general-use"))
    out = Image.open(BytesIO(out_bytes)).convert("RGBA")
    bbox = out.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        pad = 4
        out = out.crop((max(0, x0 - pad), max(0, y0 - pad),
                        min(out.size[0], x1 + pad), min(out.size[1], y1 + pad)))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT)
    print(f"  attack -> {OUT.relative_to(REPO)}  ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
