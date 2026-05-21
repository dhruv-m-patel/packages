import path from 'node:path';
import react from '@vitejs/plugin-react';
import type { InlineConfig } from 'vite';
import type { ViteConfigOptions } from './types.js';

/**
 * Build a baseline Vite `InlineConfig` for the **client** half of an SSR
 * build. Consumers can call this for `vite build` (client) and then
 * pass their own override for the server build (`build.ssr: serverEntry`).
 *
 * Options are resolved relative to `clientRoot` (defaults to
 * `process.cwd()`).
 *
 * Defaults:
 *  - `serverEntry`: `src/entry-server.tsx`
 *  - `clientEntry`: `src/entry-client.tsx`
 *  - `outDir`:      `dist`
 */
export function getViteConfig(options: ViteConfigOptions = {}): InlineConfig {
  const clientRoot = options.clientRoot ?? process.cwd();
  const clientEntry = options.clientEntry ?? 'src/entry-client.tsx';
  const outDir = options.outDir ?? 'dist';

  return {
    root: clientRoot,
    appType: 'custom',
    plugins: [react()],
    build: {
      outDir: path.join(outDir, 'client'),
      ssrManifest: true,
      manifest: true,
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(clientRoot, clientEntry),
      },
    },
  };
}

export default getViteConfig;
