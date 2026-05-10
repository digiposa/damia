import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';

const PADDING_PX = 12;
const BTN_RADIUS = 22;
const HORIZONTAL_GAP = 10;

interface MenuButtonSpec {
  label: string;
  onTap: () => void;
}

/**
 * Top-left menu button cluster for touch devices: Inventory + Settings.
 * Provides tap-equivalents of the `I` and `Esc` keys so mobile players have a
 * way to open those panels. Sits in the top-LEFT corner so it doesn't compete
 * with the minimap (which lives top-right).
 *
 * Kept deliberately small (22 px radius) — these are infrequent actions, no
 * need to take up thumb-prime real estate.
 */
export class TouchMenuButtons {
  readonly container: Container;
  private cleanupFns: Array<() => void> = [];

  constructor(app: Application, handlers: { onInventory: () => void; onSettings: () => void }) {
    this.container = new Container({ label: 'touch-menu-buttons' });

    const specs: MenuButtonSpec[] = [
      { label: 'I', onTap: handlers.onInventory },
      { label: '⚙', onTap: handlers.onSettings },
    ];
    for (const spec of specs) {
      this.container.addChild(this.makeButton(spec));
    }

    this.layoutStack(app.screen.width, app.screen.height);
    const onResize = (): void => this.layoutStack(app.screen.width, app.screen.height);
    app.renderer.on('resize', onResize);
    this.cleanupFns.push(() => app.renderer.off('resize', onResize));
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.container.destroy({ children: true });
  }

  private makeButton(spec: MenuButtonSpec): Container {
    const container = new Container({ label: `touch-menu-${spec.label}` });
    const bg = new Graphics()
      .circle(0, 0, BTN_RADIUS)
      .fill({ color: 0x1c2840, alpha: 0.85 })
      .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });
    const text = new Text({
      text: spec.label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: BTN_RADIUS,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    text.anchor.set(0.5);
    container.addChild(bg, text);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    const onTap = (e: FederatedPointerEvent): void => {
      e.stopPropagation();
      spec.onTap();
    };
    container.on('pointertap', onTap);
    this.cleanupFns.push(() => container.off('pointertap', onTap));
    return container;
  }

  /** Right-aligned row at the very top edge. With the HUD now anchored
   *  top-LEFT (mobile portrait redesign), the menu icons get the opposite
   *  corner so the two clusters don't fight for the same horizontal band.
   *  Right-to-left layout means the rightmost button hugs the screen edge
   *  and additional buttons grow inward. */
  private layoutStack(screenWidth: number, _screenHeight: number): void {
    let cursorX = screenWidth - PADDING_PX - BTN_RADIUS;
    // Iterate in reverse so children added in spec order (Inventory first,
    // Settings second) end up displayed left→right with Settings on the
    // outside edge — matches the desktop convention.
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      const child = this.container.children[i];
      if (!child) continue;
      child.position.set(cursorX, PADDING_PX + BTN_RADIUS);
      cursorX -= BTN_RADIUS * 2 + HORIZONTAL_GAP;
    }
  }
}
