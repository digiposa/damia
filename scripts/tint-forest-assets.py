"""Post-processes the Vanilla (green) forest pack into a warm autumnal palette
to match TLoD's morning/twilight forest tone.

Strategy:
- Selectively remap pixels whose hue is in the green band into the amber band.
- Slight saturation drop + value drop to add the ombré morning feel.
- Alpha is preserved untouched.

Re-run after `import-asset-pack.py` (which deposits Vanilla originals into
`public/assets/`). This script overwrites them in place.
"""

from pathlib import Path
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parent.parent

# Files to tint (everything from the itch.io pack).
TARGETS = [
    REPO / "public" / "assets" / "tiles" / "forest" / "ground.png",
    *(REPO / "public" / "assets" / "tiles" / "forest").glob("path-*.png"),
    *(REPO / "public" / "assets" / "sprites" / "props").glob("*.png"),
]

# PIL hue is 0-255 (mapping 0-360°).
# Wide green/teal band (lime → teal) crushed into orange-amber (8-26).
GREEN_MIN, GREEN_MAX = 40, 145
AMBER_MIN, AMBER_MAX = 8, 26

# Boost saturation for vivid autumn / morning highlights, slight darken.
SAT_MUL = 1.35
VAL_MUL = 0.92
# Additional warm overlay (multiply blend) — pulls everything toward sunrise amber.
WARM_OVERLAY = (255, 200, 130)
WARM_OPACITY = 0.18


def autumnize(path: Path) -> None:
    img = Image.open(path).convert("RGBA")
    rgb = img.convert("RGB")
    alpha = img.split()[3]

    hsv = np.array(rgb.convert("HSV"))  # H x W x 3, uint8
    h = hsv[..., 0].astype(np.int32)
    s = hsv[..., 1].astype(np.float32)
    v = hsv[..., 2].astype(np.float32)

    is_green = (h >= GREEN_MIN) & (h <= GREEN_MAX)
    span = max(1, GREEN_MAX - GREEN_MIN)
    t = (h - GREEN_MIN) / span
    new_h = (AMBER_MIN + t * (AMBER_MAX - AMBER_MIN)).astype(np.int32)
    h = np.where(is_green, new_h, h)

    s = np.clip(s * SAT_MUL, 0, 255).astype(np.int32)
    v = np.clip(v * VAL_MUL, 0, 255).astype(np.int32)

    new_hsv = np.stack([h, s, v], axis=-1).astype(np.uint8)
    new_rgb_img = Image.fromarray(new_hsv, "HSV").convert("RGB")

    # Warm overlay (multiply blend) for the sunrise-filtered light look.
    rgb_arr = np.array(new_rgb_img).astype(np.float32) / 255.0
    overlay = np.array(WARM_OVERLAY, dtype=np.float32) / 255.0
    blended = rgb_arr * (1 - WARM_OPACITY) + (rgb_arr * overlay) * WARM_OPACITY
    blended = np.clip(blended * 255, 0, 255).astype(np.uint8)

    out = Image.merge("RGBA", (
        Image.fromarray(blended[..., 0]),
        Image.fromarray(blended[..., 1]),
        Image.fromarray(blended[..., 2]),
        alpha,
    ))
    out.save(path)


def main() -> None:
    for path in TARGETS:
        if not path.exists():
            continue
        autumnize(path)
        print(f"  tinted {path.relative_to(REPO)}")


if __name__ == "__main__":
    main()
