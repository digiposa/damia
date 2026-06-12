/**
 * Reusable vertical scroll widget — Graphics mask + manually-translated
 * content container + pointer drag + mouse wheel. Drop into any panel
 * that needs a scrollable list of arbitrary Pixi children.
 *
 * Why we roll our own: Pixi v8 has no built-in scroll container. The
 * obvious alternatives (CSS-overflow HTML overlay, third-party scroll
 * components) either fight with our @pixi/layout flow or add a heavy
 * dependency for what's ~80 lines of pointer math.
 *
 * Usage:
 *
 *   const scroll = new ScrollableArea();
 *   panel.addChild(scroll.container);    // mount inside your modal panel
 *   // Populate the inner content (rows / cards / whatever):
 *   for (const row of rows) scroll.content.addChild(row);
 *   // Inside your applyPanelSize override, push the measured size in:
 *   scroll.setSize(innerWidth, innerHeight);
 *   // After content changes (new rows / filter / tab switch):
 *   scroll.scrollToTop();
 *   // Or, after the layout pass has settled, re-clamp against the
 *   // freshly-measured content height:
 *   app.ticker.addOnce(() => scroll.reclamp(), this);
 *
 * Inputs handled: pointer drag (touch + mouse), mouse wheel, trackpad
 * via FederatedWheelEvent. `globalpointermove` is used so a swipe that
 * wanders outside the viewport mid-drag stays tracked.
 */
import type { FederatedPointerEvent, FederatedWheelEvent } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { LayoutContainer } from '@pixi/layout/components';

import { SPACING } from './theme';

export class ScrollableArea {
  /** The Pixi container to addChild to your panel layout. Has the
   *  mask + content already mounted. Treat its `.layout.width/.height`
   *  as set by `setSize()` — don't override them externally. */
  readonly container: Container;
  /** The inner LayoutContainer — addChild your rows here. Lives behind
   *  the mask; we translate its Y manually as the user scrolls. */
  readonly content: LayoutContainer;

  private readonly mask: Graphics;
  private scrollY = 0;
  private viewportHeight = 0;

  constructor() {
    this.container = new Container({
      label: 'scrollable-area',
      layout: { width: '100%', flex: 1 },
    });
    this.container.eventMode = 'static';

    this.mask = new Graphics();
    // Generous initial rect so the mask is non-empty before the first
    // setSize() call. An empty Graphics mask hides everything, which
    // would visually wipe the modal for one frame on open. setSize()
    // replaces this with the actual viewport bounds.
    this.mask.rect(0, 0, 4096, 4096).fill(0xffffff);

    this.content = new LayoutContainer({
      layout: { flexDirection: 'column', gap: SPACING.gapSmall, width: '100%' },
    });

    this.container.addChild(this.mask, this.content);
    this.container.mask = this.mask;

    this.wireInputs();
  }

  /** Set the viewport's pixel dimensions. Call from your modal's
   *  `applyPanelSize` override with the measured-from-Modal inner
   *  rectangle. Resizes the mask, pushes the dims onto both the
   *  outer container and the inner content (so % widths on rows
   *  resolve), and re-clamps the scroll against the new height. */
  setSize(width: number, height: number): void {
    this.viewportHeight = height;
    this.container.layout = {
      ...(this.container.layout?.style ?? {}),
      width,
      height,
      flex: 0,
    };
    this.mask.clear().rect(0, 0, width, height).fill(0xffffff);
    this.content.layout = {
      ...(this.content.layout?.style ?? {}),
      width,
    };
    this.applyScroll(this.scrollY);
  }

  /** Reset the scroll position to the top. Use after you replace the
   *  content (filter change, tab switch, detail-view back) so the
   *  user lands at the start of the new list. */
  scrollToTop(): void {
    this.scrollY = 0;
    this.content.y = 0;
  }

  /** Re-apply the current scroll position against the freshly-measured
   *  content height. Useful one tick after a content change — Yoga's
   *  layout pass runs during render, so `content.height` only reflects
   *  the new rows on the next frame. */
  reclamp(): void {
    this.applyScroll(this.scrollY);
  }

  private applyScroll(targetY: number): void {
    const contentH = this.content.height || 0;
    const minY = Math.min(0, this.viewportHeight - contentH);
    this.scrollY = Math.max(minY, Math.min(0, targetY));
    this.content.y = this.scrollY;
  }

  /** Drag (touch + mouse) and wheel inputs. globalpointermove keeps
   *  the swipe tracked when the finger wanders outside the viewport
   *  mid-drag; preventDefault on wheel stops the page underneath the
   *  canvas from scrolling along on desktop. */
  private wireInputs(): void {
    let dragStartY: number | null = null;
    let dragStartScroll = 0;
    const onDown = (e: FederatedPointerEvent): void => {
      dragStartY = e.global.y;
      dragStartScroll = this.scrollY;
    };
    const onMove = (e: FederatedPointerEvent): void => {
      if (dragStartY === null) return;
      this.applyScroll(dragStartScroll + (e.global.y - dragStartY));
    };
    const onRelease = (): void => {
      dragStartY = null;
    };
    const onWheel = (e: FederatedWheelEvent): void => {
      e.preventDefault();
      this.applyScroll(this.scrollY - e.deltaY);
    };
    this.container.on('pointerdown', onDown);
    this.container.on('globalpointermove', onMove);
    this.container.on('pointerup', onRelease);
    this.container.on('pointerupoutside', onRelease);
    this.container.on('pointercancel', onRelease);
    this.container.on('wheel', onWheel);
  }
}
