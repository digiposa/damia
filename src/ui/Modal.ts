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
import type { LayoutContainer } from '@pixi/layout/components';
import { COLORS, MODAL } from './theme';

export abstract class Modal {
  /** Root container — addChild this to your UI layer. */
  readonly container: Container;
  protected readonly app: Application;
  protected readonly dim: Graphics;
  /** Inner panel — built by the subclass via `buildPanel()`. */
  protected panel: LayoutContainer | null = null;
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

  /** Subclasses build their inner panel (a LayoutContainer typically
   *  via `mkPanel`) and return it. The base mounts it as a child of
   *  the root container. Called once during the first `open()` so
   *  expensive construction is deferred until first use. */
  protected abstract buildPanel(): LayoutContainer;

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
   *  dim backdrop. Yoga handles the panel's internal layout once
   *  the outer width/height are set. */
  protected applyPanelSize(): void {
    if (!this.panel) return;
    const w = Math.min(MODAL.maxWidth, this.app.screen.width - MODAL.margin);
    const h = Math.min(MODAL.maxHeight, this.app.screen.height - MODAL.margin);
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
