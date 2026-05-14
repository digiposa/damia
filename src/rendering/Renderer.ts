// Auto-registers the Yoga-powered layout mixin on Container + the
// renderer LayoutSystem. Must be imported BEFORE `new Application()`
// so the mixin is in place when the application boots.
import '@pixi/layout';
import { Application } from 'pixi.js';

export interface RendererOptions {
  background: string;
  preference?: 'webgpu' | 'webgl';
}

export async function createRenderer(opts: RendererOptions): Promise<Application> {
  const app = new Application();

  await app.init({
    background: opts.background,
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    preference: opts.preference ?? 'webgpu',
  });

  return app;
}

export function describeRenderer(app: Application): string {
  // 1 = WebGPU, 2 = WebGL — see Pixi RendererType enum.
  return app.renderer.type === 1 ? 'WebGPU' : 'WebGL';
}
