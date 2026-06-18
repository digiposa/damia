"""Integrates the 5 Commander Seles "Slash Twice" frames from
`shareAI/assets/boss/commander-seles/slash-twice-{1..5}.png` (raw,
magenta/green-keyed) into the game-ready common canvas at
`public/assets/sprites/mobs/commander-slash-twice-{1..5}.png`.

Pipeline (per frame):
  1. Auto-detect the uniform corner background (magenta on 1/4, green
     on 2/3/5) and replace it with transparency — same matte logic as
     `matte-sprite.py` but no per-frame crop (we want a stable canvas).
  2. Apply a single uniform scale derived from frame 1 (so the character
     keeps the SAME visual size as the rest of the idle/attack set).
  3. Place each frame on the shared 1248x1395 commander canvas, anchored
     by the SOURCE-frame-1 character bbox — every frame is offset the
     same way relative to the source canvas, so the ground stays still
     between frames even when the character crouches (frame 3) or the
     pose shifts. The slash VFX overflow naturally; nothing is cropped.

The frame-1 reference scale + placement is derived from the existing
`commander-slash-twice-1.png` so the new output stays visually
consistent with the rest of the kit; the prior 2-frame integration is
re-generated identically and frames 3-5 land on the same grid.
"""

from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

REPO = Path(__file__).resolve().parent.parent
SRC_DIR = REPO / "shareAI" / "assets" / "boss" / "commander-seles"
OUT_DIR = REPO / "public" / "assets" / "sprites" / "mobs"
N_FRAMES = 5

# Hardcoded reference anchor for source frame 1 on the common canvas.
# Targets (set after a comparison against the rest of the commander
# kit on the same 1248x1395 canvas):
#   - feet at y=1301, the same ground line as commander.png /
#     commander-attack-{1,2} / commander-walk-{1,2} (so the boss doesn't
#     visually "sink" when the post-PowerUp basic attack triggers).
#   - silhouette height ~1220, scaled up ~10% from the prior anchor so
#     the character matches the apparent size of attack-1 (the closest
#     pose, sword raised; h=1261 there with sword overhead). Without the
#     bump the boss read noticeably smaller for the 750 ms the combo
#     plays.
#   - horizontal centre at cx=713, the original commit 89f9868 anchor.
#
# Re-deriving these dynamically from `public/commander-slash-twice-1.png`
# is fragile — the first script run overwrites that file, so a second
# run measures its own output and the scale drifts. Hardcoding the
# anchor keeps every run idempotent.
REF_HEIGHT_ON_CANVAS = 1220
REF_CX_ON_CANVAS = 713
REF_BOTTOM_ON_CANVAS = 1301

CANVAS_W, CANVAS_H = 1248, 1395  # matches commander.png / commander-attack-*.png
# Soft alpha thresholds (Euclidean distance in RGB to detected bg).
# Below SOFT_MIN -> fully transparent; above SOFT_MAX -> fully opaque;
# in-between -> linear ramp. The ramp kills the green/magenta halos that
# a hard binary key leaves on anti-aliased edges around the slash VFX.
BG_SOFT_MIN = 18.0
BG_SOFT_MAX = 60.0
CLOSE_ITERS = 4


def key_background(src_path: Path) -> Image.Image:
    """Auto-detect the uniform corner colour, replace with soft-alpha
    transparency, and neutralise the bg-coloured spill on the kept
    pixels so the slash VFX bordering green/magenta don't read tinted."""
    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img)
    rgb = arr[..., :3].astype(np.float32)
    corners = np.concatenate([
        rgb[:8, :8].reshape(-1, 3),
        rgb[:8, -8:].reshape(-1, 3),
        rgb[-8:, :8].reshape(-1, 3),
        rgb[-8:, -8:].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0).astype(np.float32)
    diff = rgb - bg
    dist = np.sqrt((diff * diff).sum(axis=-1))

    # Soft alpha ramp.
    alpha_f = np.clip((dist - BG_SOFT_MIN) / (BG_SOFT_MAX - BG_SOFT_MIN), 0.0, 1.0)

    # Close small holes in the character (dark internal shadows whose
    # bg-distance happens to fall under the soft floor). Operates on a
    # binary mask so we don't smear the antialiased VFX edges.
    hole_mask = alpha_f >= 0.5
    hole_mask = ndimage.binary_closing(hole_mask, iterations=CLOSE_ITERS)
    alpha_f = np.where(hole_mask & (alpha_f < 0.5), 1.0, alpha_f)

    # --- Spill removal -------------------------------------------------
    # A green-screen leaves a green tint on any kept pixel that picked up
    # bg leakage during the source's anti-aliasing; same for magenta.
    # Detect which axis the bg dominates and pull the corresponding
    # channel back toward the average of the OTHER two channels for any
    # pixel that exhibits the same dominance, scaled by how much the
    # pixel itself still leans into that channel.
    #
    # Green bg  ⇒ axis = G; pull G down if G > avg(R, B).
    # Magenta bg ⇒ axes = R + B (and G is low); pull R/B down on pixels
    # where R+B > 2*G (the magenta cast signature).
    out_rgb = rgb.copy()
    if bg[1] > bg[0] and bg[1] > bg[2]:
        # Green bg: clamp G to the avg of R and B when it's higher.
        avg_rb = (out_rgb[..., 0] + out_rgb[..., 2]) * 0.5
        spill = np.maximum(0.0, out_rgb[..., 1] - avg_rb)
        out_rgb[..., 1] = out_rgb[..., 1] - spill
    elif bg[0] > bg[1] and bg[2] > bg[1]:
        # Magenta bg: pull R and B toward G on the pixels where both R
        # and B clearly dominate G (the magenta cast signature). Scaling
        # by the spill strength keeps the natural red of the cape /
        # slash trails intact.
        spill = np.maximum(0.0, ((out_rgb[..., 0] + out_rgb[..., 2]) * 0.5) - out_rgb[..., 1])
        out_rgb[..., 0] = out_rgb[..., 0] - spill * 0.5
        out_rgb[..., 2] = out_rgb[..., 2] - spill * 0.5

    out_rgb = np.clip(out_rgb, 0.0, 255.0).astype(np.uint8)
    alpha = (alpha_f * 255.0).astype(np.uint8)
    rgba = np.concatenate([out_rgb, alpha[..., None]], axis=-1)
    return Image.fromarray(rgba, "RGBA")


def opaque_bbox(img: Image.Image, threshold: int = 128) -> tuple[int, int, int, int]:
    """(x0, y0, x1, y1) of substantially-opaque pixels. Threshold of 128
    ignores the soft-alpha fringe so the bbox tracks the actual silhouette
    instead of the (much larger) anti-aliased halo."""
    alpha = np.array(img)[..., 3]
    rows = np.any(alpha > threshold, axis=1)
    cols = np.any(alpha > threshold, axis=0)
    y_idx = np.where(rows)[0]
    x_idx = np.where(cols)[0]
    return int(x_idx[0]), int(y_idx[0]), int(x_idx[-1]) + 1, int(y_idx[-1]) + 1


def main() -> None:
    if not SRC_DIR.is_dir():
        raise SystemExit(f"Source dir not found: {SRC_DIR}")

    # --- Step 1: derive scale + offset from frame 1 source against the
    # hardcoded canvas anchor (see REF_* constants at the top). The
    # anchor matches the originally-shipped Slash Twice frame 1 from
    # commit 89f9868, which itself was scale-matched to the commander
    # idle/attack/walk set.
    src1 = key_background(SRC_DIR / "slash-twice-1.png")
    src_bbox = opaque_bbox(src1)
    src_h = src_bbox[3] - src_bbox[1]
    src_cx = (src_bbox[0] + src_bbox[2]) / 2
    src_bottom = src_bbox[3]
    print(f"source-1 bbox:  {src_bbox}  h={src_h}  cx={src_cx:.1f}  bottom={src_bottom}")

    scale = REF_HEIGHT_ON_CANVAS / src_h
    print(
        f"derived scale: {scale:.4f}  "
        f"(target h={REF_HEIGHT_ON_CANVAS}, cx={REF_CX_ON_CANVAS}, "
        f"bottom={REF_BOTTOM_ON_CANVAS})\n"
    )

    # --- Step 2: project EVERY frame through the same (scale, dst-offset).
    # Using source-frame-1's body cx/bottom as the anchor (rather than
    # re-measuring each frame) keeps the ground stable: the floor reads
    # at the same screen y across all 5 frames even when the character
    # crouches or leaps, and horizontal drift stays under the natural
    # body-sway range.
    scaled_anchor_cx = round(src_cx * scale)
    scaled_anchor_bottom = round(src_bottom * scale)
    dst_x = round(REF_CX_ON_CANVAS - scaled_anchor_cx)
    dst_y = round(REF_BOTTOM_ON_CANVAS - scaled_anchor_bottom)
    print(f"dst offset: ({dst_x}, {dst_y})\n")

    for n in range(1, N_FRAMES + 1):
        src = key_background(SRC_DIR / f"slash-twice-{n}.png")
        new_w = round(src.width * scale)
        new_h = round(src.height * scale)
        scaled = src.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        canvas.alpha_composite(scaled, dest=(dst_x, dst_y))
        out_path = OUT_DIR / f"commander-slash-twice-{n}.png"
        canvas.save(out_path)
        print(f"wrote {out_path.relative_to(REPO)}  ({canvas.size})")


if __name__ == "__main__":
    main()
