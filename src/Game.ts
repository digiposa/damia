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

/** Fade the boot screen out + remove it from the DOM after the
 *  CSS transition completes. Idempotent. */
function hideBootScreen(): void {
  const boot = document.getElementById('boot');
  if (!boot) return;
  boot.classList.add('hidden');
  // Match the 280 ms transition in index.html, then drop the node.
  setTimeout(() => boot.remove(), 320);
}

/** Lazy-load progress indicator — a small chip pinned to the top-
 *  right of the viewport while textures are downloading in the
 *  background. Created on the first call, updated thereafter, hidden
 *  + removed when the load completes. Lives in the DOM rather than
 *  the Pixi scene so it doesn't tangle with the canvas layer order. */
let loadingIndicator: HTMLDivElement | null = null;
function updateLoadingIndicator(loaded: number, total: number): void {
  if (!loadingIndicator) {
    const el = document.createElement('div');
    el.id = 'lazy-load-indicator';
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
      transition: 'opacity 280ms ease',
      opacity: '1',
      pointerEvents: 'none',
    });
    document.body.appendChild(el);
    loadingIndicator = el;
  }
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
  loadingIndicator.textContent = `Loading ${pct}%`;
}
function hideLoadingIndicator(): void {
  if (!loadingIndicator) return;
  loadingIndicator.style.opacity = '0';
  const el = loadingIndicator;
  loadingIndicator = null;
  setTimeout(() => el.remove(), 320);
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

    // Lazy preload: fire-and-forget. Title screen doesn't need any
    // texture (gear icon is Graphics, buttons are text), so we let
    // the app start immediately and let textures arrive in the
    // background as the user navigates. RenderSystem already falls
    // back to procedural shapes when a texture is missing
    // (see createNode), so a mob spawning before its sprite has
    // landed renders as the fallback capsule for the brief window
    // until the texture loads. Boot screen hides immediately; the
    // small top-right indicator below tracks the background load.
    hideBootScreen();
    void AssetManager.preload({
      onProgress: (loaded, total) => updateLoadingIndicator(loaded, total),
    }).then(() => hideLoadingIndicator());

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
