import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/** Short git SHA of the current HEAD, baked into the bundle so the running
 *  game can show which version is live. Falls back to 'dev' when git isn't
 *  available (shouldn't happen in CI or local dev, but cheap to guard). */
function readCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

// Production builds are served from `https://<user>.github.io/damia/`, so all
// asset URLs need the `/damia/` prefix. Dev mode stays at `/` so localhost
// works without the prefix in the path. AssetManager reads `import.meta.env.
// BASE_URL` to prepend the same base to runtime asset fetches.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/damia/' : '/',
  plugins: [tsconfigPaths()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(readCommit()),
  },
  server: {
    port: 5173,
    strictPort: true, // fail loudly if 5173 is busy instead of silently reallocating
    open: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
}));
