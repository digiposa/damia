"""Contact sheet: crops each candidate bbox and lays them side by side with
labels so I can see what's actually inside each bbox at native pixel res."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "shareAI" / "assetsTLOD" / "all" / "02 Forest.png"
OUT = REPO / "scripts" / "debug" / "contact_sheet.png"

# Iterate here. Each bbox is rendered in a tile of CELL_W x CELL_H.
BBOXES = {
    "mouse_search_A": (610, 1080, 730, 1180),
    "mouse_search_B": (590, 1100, 720, 1200),
    "mouse_search_C": (600, 1130, 720, 1230),
    "cock_search_A":  (590, 820, 760, 980),
    "trent_full":     (1040, 830, 1200, 1180),
    "goblin_full":    (760, 1000, 890, 1110),
}

CELL_W = 280
CELL_H = 320
COLS = 3
LABEL_H = 24


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    rows = (len(BBOXES) + COLS - 1) // COLS
    sheet = Image.new("RGBA", (CELL_W * COLS, (CELL_H + LABEL_H) * rows), (40, 40, 40, 255))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for idx, (name, bbox) in enumerate(BBOXES.items()):
        row = idx // COLS
        col = idx % COLS
        x0 = col * CELL_W
        y0 = row * (CELL_H + LABEL_H)

        # Crop and fit inside the cell.
        sub = src.crop(bbox)
        sw, sh = sub.size
        scale = min(CELL_W / sw, CELL_H / sh)
        new_size = (int(sw * scale), int(sh * scale))
        sub_resized = sub.resize(new_size, Image.NEAREST)
        # Centre inside the cell.
        cx = x0 + (CELL_W - new_size[0]) // 2
        cy = y0 + (CELL_H - new_size[1]) // 2
        sheet.paste(sub_resized, (cx, cy), sub_resized)

        label = f"{name} {bbox} {sw}x{sh}"
        draw.rectangle(
            [(x0, y0 + CELL_H), (x0 + CELL_W, y0 + CELL_H + LABEL_H)],
            fill=(20, 20, 20, 255),
        )
        draw.text((x0 + 6, y0 + CELL_H + 4), label, fill=(255, 255, 0, 255), font=font)
        # Cell border.
        draw.rectangle([(x0, y0), (x0 + CELL_W, y0 + CELL_H)], outline=(255, 255, 0, 200), width=1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT)
    print(f"wrote {OUT} ({sheet.size[0]}x{sheet.size[1]})")


if __name__ == "__main__":
    main()
