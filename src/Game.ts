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

/** Drive the boot screen's progress bar + status label while the
 *  always-resident slice is loading. Once that's done, hideBootScreen
 *  fades the whole overlay out and per-scene prefetches take over the
 *  small top-right LoadingChip. */
function updateBootProgress(loaded: number, total: number): void {
  const fill = document.getElementById('boot-bar-fill');
  const status = document.getElementById('boot-status');
  if (fill) {
    const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
    fill.style.width = `${pct}%`;
  }
  if (status) {
    status.textContent = `${loaded} / ${total}`;
  }
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

    // Always-resident asset slice: title bg, cursors, dragoon eye,
    // item icons, spell VFX. ~25 entries; loads in <1 s on a decent
    // connection. Every other slice (zone tiles, mob sprites, party
    // chars) is fetched on demand by the SceneManager prefetch hook
    // when the player enters a scene that declares the tag, and
    // freed when they leave it. See `AssetManager.loadCategory`.
    //
    // BLOCKING (await): the title screen depends on `ui.mainscreen`,
    // so showing the menu before it's ready would flash a black
    // panel. Boot overlay paints its progress bar in the meantime.
    await AssetManager.preload({
      tags: ['core', 'vfx', 'item'],
      onProgress: updateBootProgress,
    });
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
