/**
 * Abstract base class for modal overlays — Settings / Inventory /
 * LevelUpChoice / Status / AdditionsPicker / future menus.
 *
 * Centralises the boilerplate every modal needs:
 *  - Full-screen dim backdrop that swallows pointer events.
 *  - `open()` / `close()` / `isOpen` API.
 *  - Resize listener that redraws the backdrop + re-applies the
 *    panel size + position.
 *  - Raise-to-top on `open()` so the modal paints above every
 *    overlay that was addChild'd to the same layer after the
 *    GameplayUI constructor (SurvivalHUD, touch buttons, …).
 *  - `destroy()` that tears down listeners + Pixi children.
 *
 * Subclasses implement two hooks:
 *  - `buildPanel()` — return the inner panel (typically a
 *    `LayoutContainer` from `layoutHelpers.mkPanel`). Called once on
 *    construction. The base mounts it centered inside the dim.
 *  - `onOpen()` (optional) — invoked after the panel is shown but
 *    before the raise-to-top so subclasses can refresh content
 *    against live state (read components, re-render rows, etc.).
 */
import type { Application } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { COLORS, MODAL } from './theme';

export abstract class Modal {
  /** Root container — addChild this to your UI layer. */
  readonly container: Container;
  protected readonly app: Application;
  protected readonly dim: Graphics;
  /** Inner panel — built by the subclass via `buildPanel()`. Can be
   *  any Pixi Container (typically a `LayoutContainer` via `mkPanel`
   *  for flex-based modals, or a plain `Container` for legacy modals
   *  with manual positioning). */
  protected panel: Container | null = null;
  /** Override in subclasses to cap the panel's vertical footprint at
   *  something smaller than `MODAL.maxHeight`. The panel is always
   *  clamped against `screen.height - MODAL.margin` on top of this. */
  protected panelMaxHeight: number = MODAL.maxHeight;
  private isOpen_ = false;
  private readonly cleanups: Array<() => void> = [];

  constructor(app: Application, label: string) {
    this.app = app;
    this.container = new Container({ label });
    this.container.visible = false;

    this.dim = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: COLORS.dim, alpha: 0.7 });
    this.dim.eventMode = 'static';
    this.container.addChild(this.dim);

    const onResize = (): void => {
      this.dim
        .clear()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: COLORS.dim, alpha: 0.7 });
      this.applyPanelSize();
    };
    app.renderer.on('resize', onResize);
    this.cleanups.push(() => app.renderer.off('resize', onResize));
  }

  /** Subclass builds its inner panel and returns it. The base mounts
   *  it as a child of the root container. Called once during the
   *  first `open()` so expensive construction is deferred until
   *  first use. */
  protected abstract buildPanel(): Container;

  /** Optional hook fired after the panel is built / shown. Subclasses
   *  use this to refresh content from live state. */
  protected onOpen(): void {}

  /** Optional hook fired before the panel hides. */
  protected onClose(): void {}

  open(): void {
    if (!this.panel) {
      this.panel = this.buildPanel();
      this.container.addChild(this.panel);
    }
    this.applyPanelSize();
    this.container.visible = true;
    this.isOpen_ = true;
    this.onOpen();
    // Raise above any overlay that was addChild'd to the same layer
    // after us — SurvivalHUD, touch buttons, etc. Without this the
    // modal sits visually under those overlays even though the dim
    // backdrop eats pointer events correctly.
    const parent = this.container.parent;
    if (parent) parent.setChildIndex(this.container, parent.children.length - 1);
  }

  close(): void {
    this.onClose();
    this.container.visible = false;
    this.isOpen_ = false;
  }

  toggle(): void {
    if (this.isOpen_) this.close();
    else this.open();
  }

  get isOpen(): boolean {
    return this.isOpen_;
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups.length = 0;
    this.container.destroy({ children: true });
  }

  /** Recompute the panel's responsive size + center it within the
   *  dim backdrop. The default applies `min(MAX, screen - margin)` to
   *  flex-based panels (panels whose `.layout` accepts width/height
   *  in pixels). Subclasses that don't use flex layout — e.g. legacy
   *  panels with their own scale-to-fit math — should override this
   *  to do nothing or apply their own sizing. */
  protected applyPanelSize(): void {
    if (!this.panel) return;
    const w = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const h = Math.min(this.panelMaxHeight, this.app.screen.height - MODAL.margin);
    // The layout mixin tolerates being set on any Container — and on
    // panels that already have `.layout` (StatusPanel etc.) we merge
    // the existing style + the new width/height.
    const existing = this.panel.layout?.style ?? {};
    this.panel.layout = { ...existing, width: w, height: h };
    this.panel.position.set(
      Math.floor((this.app.screen.width - w) / 2),
      Math.floor((this.app.screen.height - h) / 2),
    );
  }

  /** Register a teardown function called by `destroy()`. Use this
   *  for any subclass-side listener that needs cleanup. */
  protected registerCleanup(fn: () => void): void {
    this.cleanups.push(fn);
  }
}
