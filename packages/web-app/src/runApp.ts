import cluster from 'node:cluster';
import os from 'node:os';
import type { Application } from 'express';
import type { RunOptions } from './types.js';

interface AppWithReady extends Application {
  locals: Application['locals'] & {
    ready?: Promise<unknown>;
  };
}

/**
 * Listen for HTTP traffic on the configured port. If `useClusteredStart`
 * is true and we're on the primary process, fork one worker per CPU and
 * return; otherwise (worker process or single-process mode) actually
 * `app.listen`.
 *
 * Awaits `app.locals.ready` (set by `configureApp`) so async wiring
 * (Vite middleware, the SSR catch-all, the final error handler) is
 * fully attached before the socket opens. Calls `setup()` first if
 * provided, and `callback()` after the socket is bound.
 */
export function runApp(app: Application, options: RunOptions = {}): void {
  const { port = 3000, appName, useClusteredStart, setup, callback } = options;

  if (useClusteredStart && cluster.isPrimary) {
    const workers = os.cpus().length;
    for (let i = 0; i < workers; i += 1) {
      cluster.fork();
    }
    cluster.on('exit', (worker) => {
      // eslint-disable-next-line no-console
      console.warn(`[runApp] worker ${worker.process.pid} exited; respawning`);
      cluster.fork();
    });
    return;
  }

  void (async () => {
    try {
      if (setup) {
        await Promise.resolve(setup());
      }
      const ready = (app as AppWithReady).locals.ready;
      if (ready) {
        await ready;
      }
      app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.info(
          `[runApp] ${appName ?? 'web-app'} listening on port ${port}`
        );
        callback?.();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[runApp] failed to start:', err);
      process.exit(1);
    }
  })();
}

export default runApp;
