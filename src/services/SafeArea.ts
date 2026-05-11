/**
 * Browser-reported safe-area insets, exposed as a tiny synchronous API
 * the Pixi UI components can read in their reposition() routines.
 *
 * Reads the CSS variables set in `index.html` (`--safe-area-{top,
 * right, bottom, left}`), which are seeded from `env(safe-area-inset-*)`.
 * iOS Safari requires `<meta viewport-fit=cover>` for those env() values
 * to be non-zero (notch / Dynamic Island / home indicator). Android
 * Chrome populates them when there's a gesture-nav bar or display
 * cutout. Desktop returns 0 across the board, so wiring through this
 * service is a no-op on non-touch devices.
 *
 * Why not cache + listen to resize? Because Pixi UI already calls
 * `reposition()` on every renderer resize (orientation change → window
 * resize → reposition). Re-reading on demand makes the values
 * always-current with zero coordination cost. getComputedStyle is cheap
 * when called this rarely (a handful of times per resize event).
 */
class SafeAreaService {
  get top(): number {
    return this.read('--safe-area-top');
  }
  get right(): number {
    return this.read('--safe-area-right');
  }
  get bottom(): number {
    return this.read('--safe-area-bottom');
  }
  get left(): number {
    return this.read('--safe-area-left');
  }

  private read(varName: string): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (!raw) return 0;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
}

export const SafeArea = new SafeAreaService();
