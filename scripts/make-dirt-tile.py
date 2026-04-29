"""Procedural dirt tile generator.

Produces a 2:1 RGBA PNG fully covered with warm forest-floor texture
(no border, no transparent margin) so a polygon-fill clip looks clean.
Palette tuned from `shareAI/assetsTLOD/maps/02_forest/01.png` (TLoD-style
autumn morning forest path).

Re-run with --seed N to roll a different variant.
"""
from pathlib import Path
import argparse
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "public" / "assets" / "tiles" / "forest" / "dirt-procedural.png"

WIDTH, HEIGHT = 256, 128

# Sampled-from-reference palette (RGB).
COLOR_BASE_LIGHT = np.array([170, 122, 76], dtype=np.float32)   # sun-warmed dirt
COLOR_BASE_DARK = np.array([95, 60, 35], dtype=np.float32)      # shaded depression
COLOR_PEBBLE = np.array([195, 178, 145], dtype=np.float32)      # bright stone fleck
COLOR_MOSS = np.array([72, 90, 50], dtype=np.float32)           # mossy edge tint
COLOR_DEEPSHADOW = np.array([55, 35, 20], dtype=np.float32)


def seamless_noise(
    rng: np.random.Generator, w: int, h: int, cutoff: float = 0.10
) -> np.ndarray:
    """White noise → FFT lowpass → IFFT. The FFT works on a periodic domain so
    the result tiles seamlessly: pixel (0, y) matches pixel (W-1, y) etc.

    `cutoff` controls feature size — smaller = larger smooth patches.
    """
    noise = rng.standard_normal((h, w)).astype(np.float32)
    fft = np.fft.fft2(noise)
    freq_y = np.fft.fftfreq(h).astype(np.float32)[:, None]
    freq_x = np.fft.fftfreq(w).astype(np.float32)[None, :]
    radius = np.sqrt(freq_x * freq_x + freq_y * freq_y)
    fft *= np.exp(-((radius / cutoff) ** 2))
    out = np.real(np.fft.ifft2(fft)).astype(np.float32)
    lo, hi = float(out.min()), float(out.max())
    return (out - lo) / max(hi - lo, 1e-9)


def seamless_mask(rng: np.random.Generator, w: int, h: int, density: float) -> np.ndarray:
    """Binary speckle mask that wraps. Threshold the top `density` fraction of a
    seamless noise field. Uses two distinct seamless noises summed to avoid
    visible clusters (still seamless because the sum of seamless fields is seamless)."""
    a = seamless_noise(rng, w, h, cutoff=0.45)
    b = seamless_noise(rng, w, h, cutoff=0.30)
    field = a + 0.5 * b
    threshold = np.quantile(field, 1 - density)
    return field >= threshold


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    rng = np.random.default_rng(args.seed)

    # Seamless noise layers: large-scale value, fine grain.
    coarse = seamless_noise(rng, WIDTH, HEIGHT, cutoff=0.05)
    fine = seamless_noise(rng, WIDTH, HEIGHT, cutoff=0.20)

    # Map coarse noise to a base colour gradient between dark and light dirt.
    t = np.clip(coarse[..., None], 0, 1)
    base = COLOR_BASE_DARK * (1 - t) + COLOR_BASE_LIGHT * t

    # Modulate base with fine grain (-12..+12 brightness).
    grain = (fine - 0.5) * 24
    base = np.clip(base + grain[..., None], 0, 255)

    # Sparse seamless pebble specks (bright) and shadow holes (dark).
    peb_mask = seamless_mask(rng, WIDTH, HEIGHT, density=0.008)
    base[peb_mask] = COLOR_PEBBLE
    shadow_mask = seamless_mask(rng, WIDTH, HEIGHT, density=0.012)
    base[shadow_mask] = COLOR_DEEPSHADOW

    # Hint of mossy green near the very darkest patches (organic edge feel).
    moss_threshold = float(np.quantile(coarse, 0.18))
    extra = seamless_noise(rng, WIDTH, HEIGHT, cutoff=0.30)
    moss_mask = (coarse < moss_threshold) & (extra > 0.6)
    base[moss_mask] = base[moss_mask] * 0.55 + COLOR_MOSS * 0.45

    rgba = np.concatenate([base.astype(np.uint8), np.full((HEIGHT, WIDTH, 1), 255, dtype=np.uint8)], axis=-1)
    Image.fromarray(rgba, "RGBA").save(OUT)
    print(f"wrote {OUT.relative_to(REPO)}  ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
