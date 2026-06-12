/**
 * Top-right loading indicator shown while the SceneManager is awaiting
 * a slow scene-asset prefetch. DOM-based (rather than Pixi) so it sits
 * above the canvas even when the scene's UI layer is still being torn
 * down between scenes.
 *
 * The whole module is intentionally stateful + side-effecting: there's
 * exactly one chip on the page, and `showLoadingChip` / `hideLoadingChip`
 * are idempotent so callers don't have to track instances.
 */

let chip: HTMLDivElement | null = null;

/** Create (or update) the chip. `loaded` / `total` are optional — when
 *  omitted the chip shows a spinner-less generic "Chargement…" so we
 *  can paint a label before the first onProgress tick comes in. */
export function showLoadingChip(loaded?: number, total?: number): void {
  if (!chip) {
    const el = document.createElement('div');
    el.id = 'scene-loading-chip';
    Object.assign(el.style, {
      position: 'fixed',
      top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
      right: 'calc(env(safe-area-inset-right, 0px) + 12px)',
      padding: '6px 12px',
      fontSize: '11px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '600',
      letterSpacing: '0.06em',
      color: '#c8b58a',
      backgroundColor: 'rgba(26, 31, 43, 0.85)',
      border: '1px solid rgba(160, 128, 80, 0.5)',
      borderRadius: '14px',
      zIndex: '500',
      transition: 'opacity 200ms ease',
      opacity: '1',
      pointerEvents: 'none',
    });
    document.body.appendChild(el);
    chip = el;
  }
  if (total !== undefined && total > 0 && loaded !== undefined) {
    const pct = Math.round((loaded / total) * 100);
    chip.textContent = `Chargement ${pct}%`;
  } else {
    chip.textContent = 'Chargement…';
  }
}

export function hideLoadingChip(): void {
  if (!chip) return;
  chip.style.opacity = '0';
  const el = chip;
  chip = null;
  // Match the 200 ms CSS transition, then drop the node.
  setTimeout(() => el.remove(), 240);
}
