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

    this.background = new Graphics()
      .roundRect(0, 0, 180, 64, 4)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.container.addChild(this.background);

    this.text = new Text({
      text: '',
      style: {
        fontFamily: 'monospace',
        fontSize: 12,
        fill: 0xeeeeee,
      },
    });
    this.text.position.set(8, 6);
    this.container.addChild(this.text);

    this.container.position.set(8, 8);
  }

  attach(app: Application): void {
    app.ticker.add(() => this.update(app.ticker.FPS));
  }

  private update(currentFps: number): void {
    this.samples.push(currentFps);
    if (this.samples.length > SAMPLE_WINDOW) this.samples.shift();
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.text.text = `FPS: ${currentFps.toFixed(0)} (avg ${avg.toFixed(0)})\nRenderer: ${this.rendererLabel}\nBuild: ${__BUILD_COMMIT__}`;
  }
}
