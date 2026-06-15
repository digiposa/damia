#!/usr/bin/env python3
"""
Normalize a set of sprite frames to a common canvas.

AI-generated sprite frames (the iterative workflow for Damia's mob
animations) usually come out at inconsistent dimensions: each pose's
aura / cape / weapon extends in a slightly different direction so each
PNG ends up with its own alpha bounding box. Drop them straight into
the manifest with `autoTrim: true` and RenderSystem's
`fitMode: 'height'` resolves against each frame's own bbox — the
character visibly shrinks or grows between frames of the same
animation. Turn `autoTrim` off and the canvas sizes still differ, so
the scale still drifts.

This script fixes both: it reads N input PNGs, computes the alpha
bbox of each, picks the **union** (max width × max height) of those
bboxes + a small margin, and re-emits every input on that uniform
canvas with the original alpha content bottom-centered. Drop the
resulting files into the manifest with `autoTrim: false` and every
frame renders at the same effective scale + the feet land on the same
ground line, regardless of how the AI gen happened to lay out each
pose internally.

Usage:
    python3 scripts/normalize-frames.py <PNG> [<PNG> ...]

Options:
    --margin N      Transparent padding around the union bbox (default 20).
                    Bottom margin is half of this so the figure sits a touch
                    above the canvas floor — same convention as the existing
                    Commander death frames.
    --dry-run       Print what would change without writing.

The script overwrites the input files in place. Run from the project
root so the conventional manifest URLs keep working
(`public/assets/sprites/mobs/foo.png`). Add new files first to the
checked path, then run this — the AI-gen dimensions are dropped and
the canon engine-friendly ones replace them.

Example (the Commander Power Up frames this script is calibrated for):

    python3 scripts/normalize-frames.py \\
        public/assets/sprites/mobs/commander-powerup-1.png \\
        public/assets/sprites/mobs/commander-powerup-2.png
"""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.stderr.write(
        "PIL/Pillow is required. Install with: pip install --user Pillow\n"
    )
    sys.exit(1)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Normalize sprite frames to a common canvas.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Workflow: drop AI-gen PNGs into public/assets/sprites/<group>/, "
            "run this script on the set, register the resulting aliases in "
            "AssetManager with `autoTrim: false`."
        ),
    )
    p.add_argument("paths", nargs="+", help="PNG files to normalize (in place).")
    p.add_argument(
        "--margin",
        type=int,
        default=20,
        help="Transparent padding around the union bbox (default 20).",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned canvas + placements without writing.",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    if len(args.paths) < 2:
        sys.stderr.write(
            "Need at least 2 frames to normalize — a single frame has "
            "nothing to align against. For a one-shot resize use a regular "
            "image editor.\n"
        )
        return 2

    # --- Read inputs + alpha bboxes ---
    bboxes = []  # (path, Image, bbox-tuple)
    for path in args.paths:
        if not os.path.isfile(path):
            sys.stderr.write(f"Not a file: {path}\n")
            return 2
        img = Image.open(path).convert("RGBA")
        bbox = img.getbbox()
        if bbox is None:
            sys.stderr.write(f"{path}: image is fully transparent.\n")
            return 2
        bboxes.append((path, img, bbox))
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        print(f"{path}: canvas={img.size} alpha_bbox=({w}, {h})")

    # --- Compute the union canvas ---
    max_w = max(b[2] - b[0] for _, _, b in bboxes)
    max_h = max(b[3] - b[1] for _, _, b in bboxes)
    target_w = max_w + args.margin * 2
    target_h = max_h + args.margin  # bottom margin is half — figure sits low
    print(f"\nUniform target canvas: {target_w} × {target_h}")

    if args.dry_run:
        print("(dry-run — no files written)")
        return 0

    # --- Re-emit each frame on the uniform canvas, bottom-centered ---
    for path, img, bbox in bboxes:
        cropped = img.crop(bbox)
        cw, ch = cropped.size
        new = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
        px = (target_w - cw) // 2
        py = target_h - ch - args.margin // 2
        new.paste(cropped, (px, py), cropped)
        new.save(path, optimize=True)
        print(f"wrote {path}: {new.size}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
