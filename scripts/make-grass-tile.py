"""Procedural grass tile generator — same seamless FFT approach as the dirt
tile, palette tuned to TLoD's autumnal mossy forest floor (dark olive green base
with scattered amber leaves)."""
from pathlib import Path
import argparse
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "public" / "assets" / "tiles" / "forest" / "grass-procedural.png"

WIDTH, HEIGHT = 256, 128

COLOR_BASE_DARK = np.array([45, 60, 32], dtype=np.float32)      # deep moss
COLOR_BASE_LIGHT = np.array([110, 128, 70], dtype=np.float32)   # sun-touched olive
COLOR_LEAF_AMBER = np.array([175, 130, 60], dtype=np.float32)   # fallen autumn leaf
COLOR_LEAF_RUST = np.array([135, 70, 35], dtype=np.float32)     # rust leaf accent
COLOR_DEEPSHADOW = np.array([25, 38, 20], dtype=np.float32)


def seamless_noise(rng, w, h, cutoff=0.10):
    noise = rng.standard_normal((h, w)).astype(np.float32)
    fft = np.fft.fft2(noise)
    fy = np.fft.fftfreq(h).astype(np.float32)[:, None]
    fx = np.fft.fftfreq(w).astype(np.float32)[None, :]
    fft *= np.exp(-((np.sqrt(fx * fx + fy * fy) / cutoff) ** 2))
    out = np.real(np.fft.ifft2(fft)).astype(np.float32)
    lo, hi = float(out.min()), float(out.max())
    return (out - lo) / max(hi - lo, 1e-9)


def seamless_mask(rng, w, h, density):
    a = seamless_noise(rng, w, h, cutoff=0.45)
    b = seamless_noise(rng, w, h, cutoff=0.30)
    field = a + 0.5 * b
    return field >= np.quantile(field, 1 - density)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=17)
    args = parser.parse_args()
    rng = np.random.default_rng(args.seed)

    coarse = seamless_noise(rng, WIDTH, HEIGHT, cutoff=0.05)
    fine = seamless_noise(rng, WIDTH, HEIGHT, cutoff=0.20)

    t = np.clip(coarse[..., None], 0, 1)
    base = COLOR_BASE_DARK * (1 - t) + COLOR_BASE_LIGHT * t

    grain = (fine - 0.5) * 22
    base = np.clip(base + grain[..., None], 0, 255)

    # Scattered amber autumn leaves.
    amber_mask = seamless_mask(rng, WIDTH, HEIGHT, density=0.014)
    base[amber_mask] = base[amber_mask] * 0.25 + COLOR_LEAF_AMBER * 0.75

    # Sparser rust-coloured accents.
    rust_mask = seamless_mask(rng, WIDTH, HEIGHT, density=0.005)
    base[rust_mask] = base[rust_mask] * 0.3 + COLOR_LEAF_RUST * 0.7

    # Tiny deep-shadow holes (between grass tufts).
    shadow_mask = seamless_mask(rng, WIDTH, HEIGHT, density=0.010)
    base[shadow_mask] = COLOR_DEEPSHADOW

    rgba = np.concatenate(
        [base.astype(np.uint8), np.full((HEIGHT, WIDTH, 1), 255, dtype=np.uint8)],
        axis=-1,
    )
    Image.fromarray(rgba, "RGBA").save(OUT)
    print(f"wrote {OUT.relative_to(REPO)}  ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
