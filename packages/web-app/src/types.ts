import type express from 'express';
import type { InlineConfig } from 'vite';

/**
 * Express Request augmented with a per-request trace id (set by the
 * `requestTracing` middleware shipped with this package).
 */
export interface ExtendedRequest extends express.Request {
  id?: string;
}

/**
 * Options accepted by `configureApp`.
 */
export interface WebAppOptions {
  /** Display name for the app. Surfaced through `/health`. Defaults to `'web-app'`. */
  appName?: string;
  /**
   * Runtime mode. Drives whether Vite middleware mode SSR is wired up
   * (development) or the pre-built bundle is served (production).
   * Defaults to `process.env.NODE_ENV` or `'production'`.
   */
  mode?: 'development' | 'production';
  /**
   * Project root used as the Vite root and as the base for resolving
   * `serverEntry`, `templateHtml`, and built bundle paths.
   * Defaults to `process.cwd()`.
   */
  clientRoot?: string;
  /**
   * Path to the SSR entry source file (resolved from `clientRoot`).
   * Defaults to `'src/entry-server.tsx'`.
   */
  serverEntry?: string;
  /**
   * Path to the HTML template used by the SSR catch-all route
   * (resolved from `clientRoot`). Defaults to `'index.html'`.
   */
  templateHtml?: string;
  /**
   * Additional directories to expose with `express.static` in
   * production. Each entry is resolved against `clientRoot`.
   */
  staticDirectories?: string[];
  /**
   * If provided, enables `express-session` with this secret.
   */
  sessionSecret?: string;
  /**
   * Hook for the consumer to mount API routes / middleware on the
   * Express app before the SSR catch-all is installed. Awaited if it
   * returns a Promise.
   */
  setup?: (app: express.Application) => void | Promise<void>;
  /**
   * Vite config override merged into the base SSR config via
   * `mergeConfig` from `'vite'`.
   */
  viteConfig?: InlineConfig;
}

/**
 * Options accepted by `runApp`.
 */
export interface RunOptions {
  /** Port to listen on. Defaults to 3000. */
  port?: number;
  /** Display name used in the listen log message. */
  appName?: string;
  /** When true and running on the primary process, fork one worker per CPU. */
  useClusteredStart?: boolean;
  /** Hook invoked before `app.listen`. Awaited if it returns a Promise. */
  setup?: () => void | Promise<void>;
  /** Hook invoked once the server is listening. */
  callback?: () => void;
}

/**
 * Options accepted by `getViteConfig`.
 */
export interface ViteConfigOptions {
  /** Project root passed through to Vite as `root`. Defaults to `process.cwd()`. */
  clientRoot?: string;
  /** SSR entry path relative to `clientRoot`. Defaults to `'src/entry-server.tsx'`. */
  serverEntry?: string;
  /** Client entry path relative to `clientRoot`. Defaults to `'src/entry-client.tsx'`. */
  clientEntry?: string;
  /** Output directory relative to `clientRoot`. Defaults to `'dist'`. */
  outDir?: string;
}
