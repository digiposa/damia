/**
 * Layout-helper factories for `@pixi/layout` (Yoga-powered flexbox).
 *
 * The single most-frequent gotcha when migrating a UI to layout-mode
 * is that **a child without `.layout` is invisible to its parent's
 * flex flow** — it stays at its raw transform (default (0, 0)),
 * stacking on top of every other unlaid child. These factories solve
 * that by setting an explicit `.layout` on every leaf or container
 * they create, so the caller never thinks about it.
 *
 * Convention: every new panel / overlay built with `@pixi/layout`
 * should reach for one of these helpers rather than `new Text(...)`
 * / `new Graphics()` / `new Container()` directly.
 */
import type { Graphics as GraphicsType, TextStyleOptions } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';
import type { LayoutStyles } from '@pixi/layout';
import { COLORS, SPACING } from './theme';

/** A Yoga layout style object. Re-exported so consumers don't pull
 *  the @pixi/layout types directly. */
export type LayoutStyle = LayoutStyles;

/**
 * Create a Pixi `Text` whose `.layout` is set to `{ isLeaf: true }`.
 * Yoga reads the text's intrinsic Pixi bounds to size it inside the
 * parent's flex flow — exactly what we want for labels / values.
 * Extra layout style can be merged via `extraLayout`.
 */
export function mkText(text: string, style: TextStyleOptions, extraLayout?: LayoutStyle): Text {
  const t = new Text({ text, style });
  t.layout = { isLeaf: true, ...(extraLayout ?? {}) };
  return t;
}

/**
 * Create a Pixi `Graphics` shape that participates in its parent's
 * flex flow with an explicit `width × height` footprint. The `draw`
 * callback paints inside the (0, 0) origin — Yoga places the result.
 * Use this for any drawn icon / divider / decorative element that
 * needs to live alongside Text inside a flex container.
 */
export function mkGraphics(
  width: number,
  height: number,
  draw: (g: GraphicsType) => void,
  extraLayout?: LayoutStyle,
): GraphicsType {
  const g = new Graphics();
  draw(g);
  g.layout = { width, height, isLeaf: true, ...(extraLayout ?? {}) };
  return g;
}

/**
 * Pixi `Container` configured as a horizontal flex row. Children
 * still need their own `.layout` (use `mkText` / `mkGraphics` / one
 * of the other helpers) to be positioned by Yoga.
 */
export function mkRow(opts: { children?: Container[]; layout?: LayoutStyle } = {}): Container {
  const c = new Container({
    layout: { flexDirection: 'row', ...(opts.layout ?? {}) },
  });
  if (opts.children) c.addChild(...opts.children);
  return c;
}

/** Pixi `Container` configured as a vertical flex column. */
export function mkColumn(opts: { children?: Container[]; layout?: LayoutStyle } = {}): Container {
  const c = new Container({
    layout: { flexDirection: 'column', ...(opts.layout ?? {}) },
  });
  if (opts.children) c.addChild(...opts.children);
  return c;
}

/**
 * Pre-styled `LayoutContainer` representing a card or sub-panel —
 * dark background, accent border, rounded corners, default padding.
 * Override or extend via `layout`.
 */
export function mkSubPanel(opts: { layout?: LayoutStyle } = {}): LayoutContainer {
  return new LayoutContainer({
    layout: {
      flexDirection: 'column',
      padding: SPACING.pad,
      gap: SPACING.gapSmall,
      backgroundColor: COLORS.subPanelBg,
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 6,
      ...(opts.layout ?? {}),
    },
  });
}

/**
 * Pre-styled `LayoutContainer` representing a full modal panel —
 * darker background, thicker accent border, larger padding.
 */
export function mkPanel(opts: { layout?: LayoutStyle } = {}): LayoutContainer {
  return new LayoutContainer({
    layout: {
      flexDirection: 'column',
      padding: SPACING.pad,
      gap: SPACING.gap,
      backgroundColor: COLORS.panelBg,
      borderColor: COLORS.border,
      borderWidth: 2,
      borderRadius: 8,
      ...(opts.layout ?? {}),
    },
  });
}

/**
 * Generic clickable button with hover-tint feedback. Returns a leaf
 * container with the requested width × height so it fits naturally
 * in a flex row / column. The `label` glyph is centered on the
 * background. Variants:
 *   - `primary` (default) — full-width action button.
 *   - `stepper` — small square +/-/</> button used by Settings.
 */
export function mkButton(opts: {
  label: string;
  width: number;
  height: number;
  onTap: () => void;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
}): LayoutContainer {
  // Background + border are drawn by the layout system via `backgroundColor`
  // / `borderColor` / `borderRadius`, so they redraw at the actual computed
  // size after Yoga measures the container — no scaling, no rasterized
  // pixels stretched. This matters for action buttons that override
  // `layout.width: '100%'` (settings panel "Resume" / "Quit to title"),
  // where a fixed-size Graphics background would otherwise be scaled by
  // Yoga and appear blurry on desktop where the panel is wider than the
  // declared `width` default.
  const c = new LayoutContainer({
    label: `button-${opts.label}`,
    layout: {
      width: opts.width,
      height: opts.height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.buttonBg,
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 5,
    },
  });
  const text = new Text({
    text: opts.label,
    style: {
      fill: COLORS.textValue,
      fontSize: opts.fontSize ?? 14,
      fontWeight: opts.fontWeight ?? 'bold',
    },
  });
  text.layout = { isLeaf: true };
  c.addChild(text);
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.on('pointertap', opts.onTap);
  c.on('pointerover', () => {
    c.background.tint = COLORS.borderActive;
  });
  c.on('pointerout', () => {
    c.background.tint = 0xffffff;
  });
  return c;
}

/**
 * Standard "×" close button used by modal panels (top-right corner).
 * Tap fires `onTap`. The returned container is a 28 × 28 leaf so it
 * fits naturally into a flex header row (`justify-content: flex-end`).
 */
export function mkCloseButton(onTap: () => void): Container {
  const c = new Container({ label: 'modal-close' });
  const bg = new Graphics()
    .roundRect(0, 0, 28, 28, 4)
    .fill({ color: COLORS.buttonBg, alpha: 0.95 })
    .stroke({ width: 1, color: COLORS.border, alpha: 0.9 });
  const x = new Text({
    text: '×',
    style: { fill: COLORS.textValue, fontSize: 22, fontWeight: 'bold' },
  });
  // Center the × glyph inside the 28 px button. The glyph's natural
  // bounds aren't centered on its baseline, so a tiny manual offset
  // looks better than relying on text-align.
  x.position.set(9, 0);
  c.addChild(bg, x);
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.on('pointertap', onTap);
  c.layout = { width: 28, height: 28, isLeaf: true };
  return c;
}
