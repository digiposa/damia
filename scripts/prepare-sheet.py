#!/usr/bin/env python3
"""
Prepare an AI-generated sprite (or sprite sheet) for the Damia engine.

The standard ChatGPT workflow Damia uses produces sprites on a solid
chroma-key background (magenta #FF00FF by default) — sometimes a single
master sprite, sometimes an N×M grid of animation frames. This script
runs the full asset-onboarding pipeline in one shot:

    1. Auto-detect the background colour (samples the 4 corners of the
       input). Override with --bg-color #RRGGBB if the gen drifted.
    2. Chroma key with a tolerance band (--fuzz N: any pixel within
       ±N per RGB channel of the background colour becomes fully
       transparent).
    3. Optional grid split (--rows N --cols M) to slice a sheet into
       individual frame PNGs.
    4. Optional frame normalization (--normalize) to pad every output
       to a common canvas with the figure bottom-centered — same logic
       as scripts/normalize-frames.py.

Usage:

    # Single master sprite → one transparent-bg PNG
    python3 scripts/prepare-sheet.py master.png \\
        --out public/assets/sprites/mobs/commander.png

    # Sprite sheet split into a 2×4 grid (2 rows × 4 cols)
    python3 scripts/prepare-sheet.py walk-sheet.png \\
        --rows 2 --cols 4 \\
        --out-pattern public/assets/sprites/mobs/commander-walk-{n}.png \\
        --normalize

    # Custom bg colour (e.g. lime green chromakey)
    python3 scripts/prepare-sheet.py sheet.png --bg-color '#00FF00' ...

The script overwrites whatever it writes to. Always commit the input
to git first if you want a backup.
"""

import argparse
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.stderr.write("PIL/Pillow required: pip install --user Pillow\n")
    sys.exit(1)


HEX_COLOR_RE = re.compile(r"^#?([0-9a-fA-F]{6})$")


def parse_hex_color(s: str) -> tuple[int, int, int]:
    m = HEX_COLOR_RE.match(s.strip())
    if not m:
        raise argparse.ArgumentTypeError(f"Bad colour: {s!r} (expected #RRGGBB)")
    h = m.group(1)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def auto_detect_bg(img: Image.Image) -> tuple[int, int, int]:
    """Sample the four corners + return the average. Robust against a
    single noisy pixel (one corner that happens to clip the figure)."""
    w, h = img.size
    rgb = img.convert("RGB")
    corners = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w - 1, 0)),
        rgb.getpixel((0, h - 1)),
        rgb.getpixel((w - 1, h - 1)),
    ]
    # Median per channel — ignores any single corner that happens to
    # contain figure pixels (rare but possible with full-bleed art).
    rs = sorted(c[0] for c in corners)
    gs = sorted(c[1] for c in corners)
    bs = sorted(c[2] for c in corners)
    return (rs[1] + rs[2]) // 2, (gs[1] + gs[2]) // 2, (bs[1] + bs[2]) // 2


def chromakey(img: Image.Image, bg: tuple[int, int, int], fuzz: int) -> Image.Image:
    """Turn every pixel within ±fuzz of `bg` (per channel) fully
    transparent. Edge pixels with intermediate distance get a
    proportional alpha so anti-aliased silhouettes don't read as
    a hard cutout."""
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    br, bgg, bb = bg
    # Anti-alias band: half the fuzz width below it pixels fade out
    # linearly to fully transparent. Above 1.5×fuzz they're kept opaque.
    inner = fuzz
    outer = max(1, int(fuzz * 1.5))
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dr = abs(r - br)
            dg = abs(g - bgg)
            db = abs(b - bb)
            d = max(dr, dg, db)
            if d <= inner:
                pixels[x, y] = (r, g, b, 0)
            elif d < outer:
                # Fade from 0 → 255 as distance grows past `inner`.
                fade = (d - inner) / (outer - inner)
                pixels[x, y] = (r, g, b, int(a * fade))
            # else: keep opaque
    return rgba


def split_grid(img: Image.Image, rows: int, cols: int) -> list[Image.Image]:
    w, h = img.size
    cw = w // cols
    ch = h // rows
    out = []
    for r in range(rows):
        for c in range(cols):
            box = (c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
            out.append(img.crop(box))
    return out


def normalize(frames: list[Image.Image], margin: int) -> list[Image.Image]:
    """Pad every frame to a common canvas (max alpha bbox + margin),
    figures bottom-centered. Drops frames with no alpha content (all
    transparent) — they were probably empty cells in the grid."""
    bboxes = []
    for f in frames:
        bb = f.getbbox()
        if bb is None:
            continue
        bboxes.append((f, bb))
    if not bboxes:
        return []
    max_w = max(b[2] - b[0] for _, b in bboxes)
    max_h = max(b[3] - b[1] for _, b in bboxes)
    tw = max_w + margin * 2
    th = max_h + margin
    out = []
    for f, bb in bboxes:
        cropped = f.crop(bb)
        cw, ch = cropped.size
        new = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        px = (tw - cw) // 2
        py = th - ch - margin // 2
        new.paste(cropped, (px, py), cropped)
        out.append(new)
    return out


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Chromakey + optional split + normalize an AI-gen sprite.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Pipeline: auto-detect bg → chromakey → optional split → "
            "optional normalize → write."
        ),
    )
    p.add_argument("input", help="Source PNG (single sprite or sheet).")
    p.add_argument(
        "--bg-color",
        type=parse_hex_color,
        default=None,
        help="Background colour to key out (#RRGGBB). Default: auto-detect "
        "from the four corners (median).",
    )
    p.add_argument(
        "--fuzz",
        type=int,
        default=40,
        help="Tolerance band around the bg colour (default 40). Larger "
        "for noisy AI-gen backgrounds, smaller for clean solid bg.",
    )
    p.add_argument("--rows", type=int, default=1, help="Grid rows (default 1).")
    p.add_argument("--cols", type=int, default=1, help="Grid cols (default 1).")
    p.add_argument(
        "--normalize",
        action="store_true",
        help="Pad every output frame to a common canvas (recommended for "
        "multi-frame animations). Ignored when output is a single frame.",
    )
    p.add_argument(
        "--margin",
        type=int,
        default=20,
        help="Normalization padding (default 20).",
    )
    p.add_argument(
        "--out",
        help="Output path for the single-frame case (rows=cols=1).",
    )
    p.add_argument(
        "--out-pattern",
        help="Output path template for the multi-frame case. Use {n} as "
        "the 1-based frame index placeholder, e.g. "
        "'commander-walk-{n}.png'.",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    if not os.path.isfile(args.input):
        sys.stderr.write(f"Not a file: {args.input}\n")
        return 2
    img = Image.open(args.input)

    bg = args.bg_color if args.bg_color else auto_detect_bg(img)
    print(f"Background colour: #{bg[0]:02X}{bg[1]:02X}{bg[2]:02X} (fuzz {args.fuzz})")

    keyed = chromakey(img, bg, args.fuzz)

    n_frames = args.rows * args.cols
    if n_frames == 1:
        out_path = args.out or args.input
        os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
        keyed.save(out_path, optimize=True)
        print(f"wrote {out_path}: {keyed.size}")
        return 0

    if not args.out_pattern:
        sys.stderr.write(
            "--out-pattern required when --rows × --cols > 1. "
            "Use {n} as the frame index placeholder.\n"
        )
        return 2

    frames = split_grid(keyed, args.rows, args.cols)
    if args.normalize:
        frames = normalize(frames, args.margin)

    for i, f in enumerate(frames, start=1):
        path = args.out_pattern.replace("{n}", str(i))
        os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
        f.save(path, optimize=True)
        print(f"wrote {path}: {f.size}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
