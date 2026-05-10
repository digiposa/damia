import type { Application } from 'pixi.js';
import { Container, Graphics, Text } from 'pixi.js';

const SAMPLE_WINDOW = 60;

export class DebugOverlay {
  readonly container: Container;
  private readonly text: Text;
  private readonly background: Graphics;
  private readonly samples: number[] = [];
  private rendererLabel = '';

  constructor(rendererLabel: string) {
    this.container = new Container({ label: 'debug-overlay' });
    this.rendererLabel = rendererLabel;

    // Compact one-line strip parked at the very bottom of the screen so it
    // doesn't compete with the HUD top-left or the menu buttons top-right
    // on portrait mobile. Build SHA stays visible at all times for cache
    // verification — the trade-off is the strip floats above the hotbar.
    this.background = new Graphics()
      .roundRect(0, 0, 200, 18, 3)
      .fill({ color: 0x000000, alpha: 0.55 });
    this.container.addChild(this.background);

    this.text = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: 0xeeeeee,
      },
    });
    this.text.position.set(6, 3);
    this.container.addChild(this.text);
  }

  attach(app: Application): void {
    app.ticker.add(() => this.update(app.ticker.FPS));
    // Centred just below the screen top by default; reposition on resize so
    // it tracks rotation. The strip is short (200 px) so it sits on top of
    // the zone title which fades anyway.
    const place = (): void => {
      this.container.position.set((app.screen.width - 200) / 2, 4);
    };
    place();
    app.renderer.on('resize', place);
  }

  private update(currentFps: number): void {
    this.samples.push(currentFps);
    if (this.samples.length > SAMPLE_WINDOW) this.samples.shift();
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.text.text = `${avg.toFixed(0)} fps · ${this.rendererLabel} · ${__BUILD_COMMIT__}`;
  }
}
