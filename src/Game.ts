import type { Application } from 'pixi.js';
import { createRenderer, describeRenderer } from '@rendering/Renderer';
import { DebugOverlay } from '@rendering/debug/DebugOverlay';
import { SceneManager } from '@scenes/SceneManager';
import { BootScene } from '@scenes/BootScene';
import { initI18n } from '@services/I18nService';
import { initAudioManager } from '@services/AudioManager';
import { AssetManager } from '@services/AssetManager';

export interface GameContext {
  app: Application;
  scenes: SceneManager;
}

const BACKGROUND_COLOR = '#1a2820';

/** Update the HTML boot-screen progress bar + status text. The DOM
 *  elements are painted directly by index.html before any JS runs,
 *  so we just lookup + nudge their styles. No-op if the elements
 *  aren't there (Game can also be embedded in a host without the
 *  boot screen). */
function updateBootProgress(loaded: number, total: number): void {
  const fill = document.getElementById('boot-bar-fill');
  const status = document.getElementById('boot-status');
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
  if (fill) fill.style.width = `${pct}%`;
  if (status) status.textContent = `Loading… ${loaded}/${total}`;
}

/** Fade the boot screen out + remove it from the DOM after the
 *  CSS transition completes. Idempotent. */
function hideBootScreen(): void {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('hidden');
  // Match the 280 ms transition in index.html, then drop the node.
  setTimeout(() => boot.remove(), 320);
}

export class Game {
  private app!: Application;
  private scenes!: SceneManager;
  private debug!: DebugOverlay;

  async start(mountInto: HTMLElement): Promise<void> {
    // Bootstrap services that the rest of the app depends on.
    await initI18n();
    initAudioManager();

    this.app = await createRenderer({ background: BACKGROUND_COLOR });
    mountInto.appendChild(this.app.canvas);

    // Preload texture-kind assets (mob sprites, ground tiles) before any scene
    // queries them via AssetManager.getTexture(). The boot screen in
    // index.html is up and showing a progress bar — we feed it the
    // running count so the user sees concrete movement instead of a
    // frozen 0%. Once the promise resolves we fade the screen out.
    await AssetManager.preload({ onProgress: updateBootProgress });
    hideBootScreen();

    this.scenes = new SceneManager();
    const ctx: GameContext = { app: this.app, scenes: this.scenes };

    this.app.stage.sortableChildren = true;

    this.debug = new DebugOverlay(describeRenderer(this.app));
    this.debug.attach(this.app);
    this.debug.container.zIndex = 1000;
    this.app.stage.addChild(this.debug.container);

    this.app.ticker.add((ticker) => {
      this.scenes.update(ticker.deltaMS, ctx);
    });

    await this.scenes.switchTo(new BootScene(), ctx);

    console.info('[Damia] Game started — renderer:', describeRenderer(this.app));
  }
}
