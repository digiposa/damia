import { Container, Graphics, Text } from 'pixi.js';
import type { Application, FederatedPointerEvent } from 'pixi.js';

const PADDING_PX = 12;
const BTN_RADIUS = 22;
const HORIZONTAL_GAP = 10;

interface MenuButtonSpec {
  /** Initial label. May be overridden every frame via `getLabel()`. */
  label: string;
  onTap: () => void;
  /** Optional dynamic label callback — polled each frame so e.g. the
   *  mute icon can flip between 🔊 and 🔇 based on the audio state. */
  getLabel?: () => string;
}

/**
 * Top-right menu button cluster for touch devices: Inventory + Mute +
 * Settings. Provides tap-equivalents of `I`, mute toggle and `Esc` so
 * mobile players have UI for those without a keyboard. Sits in the
 * top-RIGHT corner since the HUD owns top-LEFT.
 *
 * Kept deliberately small (22 px radius) — these are infrequent
 * actions, no need to take up thumb-prime real estate.
 */
export class TouchMenuButtons {
  readonly container: Container;
  private cleanupFns: Array<() => void> = [];
  private buttons: Array<{ spec: MenuButtonSpec; label: Text; lastLabel: string }> = [];
  private tickerCb: (() => void) | null = null;
  private app: Application;

  constructor(
    app: Application,
    handlers: {
      onInventory: () => void;
      onSettings: () => void;
      onMute: () => void;
      isMuted: () => boolean;
    },
  ) {
    this.app = app;
    this.container = new Container({ label: 'touch-menu-buttons' });

    const muteLabel = (): string => (handlers.isMuted() ? '🔇' : '🔊');
    const specs: MenuButtonSpec[] = [
      { label: 'I', onTap: handlers.onInventory },
      { label: muteLabel(), onTap: handlers.onMute, getLabel: muteLabel },
      { label: '⚙', onTap: handlers.onSettings },
    ];
    for (const spec of specs) {
      const built = this.makeButton(spec);
      this.buttons.push({ spec, label: built.label, lastLabel: spec.label });
      this.container.addChild(built.container);
    }

    this.layoutStack(app.screen.width, app.screen.height);
    const onResize = (): void => this.layoutStack(app.screen.width, app.screen.height);
    app.renderer.on('resize', onResize);
    this.cleanupFns.push(() => app.renderer.off('resize', onResize));

    // Tick callback to refresh dynamic labels (mute icon) each frame.
    this.tickerCb = (): void => this.refreshLabels();
    app.ticker.add(this.tickerCb);
  }

  destroy(): void {
    if (this.tickerCb) this.app.ticker.remove(this.tickerCb);
    this.tickerCb = null;
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns.length = 0;
    this.container.destroy({ children: true });
  }

  private makeButton(spec: MenuButtonSpec): { container: Container; label: Text } {
    const container = new Container({ label: `touch-menu-${spec.label}` });
    const bg = new Graphics()
      .circle(0, 0, BTN_RADIUS)
      .fill({ color: 0x1c2840, alpha: 0.85 })
      .stroke({ width: 2, color: 0xa08050, alpha: 0.9 });
    const label = new Text({
      text: spec.label,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: BTN_RADIUS,
        fill: 0xfaf6e8,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    label.anchor.set(0.5);
    container.addChild(bg, label);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    const onTap = (e: FederatedPointerEvent): void => {
      e.stopPropagation();
      spec.onTap();
    };
    container.on('pointertap', onTap);
    this.cleanupFns.push(() => container.off('pointertap', onTap));
    return { container, label };
  }

  /** Right-aligned row at the very top edge. The HUD owns top-LEFT, so
   *  the menu icons hug the opposite corner. Right-to-left layout: the
   *  rightmost button anchors to the screen edge, additional buttons
   *  grow inward. */
  private layoutStack(screenWidth: number, _screenHeight: number): void {
    let cursorX = screenWidth - PADDING_PX - BTN_RADIUS;
    // Iterate in reverse so children added in spec order (Inventory,
    // Mute, Settings) end up displayed left→right with Settings on the
    // outside edge — keeps the desktop convention.
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      const child = this.container.children[i];
      if (!child) continue;
      child.position.set(cursorX, PADDING_PX + BTN_RADIUS);
      cursorX -= BTN_RADIUS * 2 + HORIZONTAL_GAP;
    }
  }

  /** Polls each button's `getLabel` and updates the Text node when the
   *  reported label has changed. Cheap — at most 3 string comparisons
   *  + a Text.text assign per frame, and Pixi skips re-glyphing if the
   *  text didn't actually change. */
  private refreshLabels(): void {
    for (const entry of this.buttons) {
      if (!entry.spec.getLabel) continue;
      const next = entry.spec.getLabel();
      if (next !== entry.lastLabel) {
        entry.label.text = next;
        entry.lastLabel = next;
      }
    }
  }
}
