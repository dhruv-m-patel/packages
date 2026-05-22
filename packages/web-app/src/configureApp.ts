import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import session from 'express-session';
import morgan from 'morgan';
import type { InlineConfig, ViteDevServer } from 'vite';
import { finalErrorHandler } from './middleware/finalErrorHandler.js';
import { createHealthCheck } from './middleware/healthCheck.js';
import { requestTracing } from './middleware/requestTracing.js';
import type { WebAppOptions } from './types.js';

/**
 * Shape we expect a project's SSR entry to expose. The entry is
 * loaded via `vite.ssrLoadModule` (dev) or `import()` (prod).
 */
interface SsrEntryModule {
  render: (
    url: string,
    opts?: Record<string, unknown>
  ) => Promise<{ html: string; head?: string }>;
}

function resolveMode(options: WebAppOptions): 'development' | 'production' {
  if (options.mode) return options.mode;
  const env = process.env.NODE_ENV;
  return env === 'development' ? 'development' : 'production';
}

async function readTemplate(templatePath: string): Promise<string> {
  return fs.readFile(templatePath, 'utf-8');
}

function injectTemplate(
  template: string,
  appHtml: string,
  appHead: string
): string {
  return template
    .replace('<!--app-head-->', appHead)
    .replace('<!--app-html-->', appHtml);
}

/**
 * Configure an Express SSR application backed by Vite.
 *
 * In `development`, Vite is run in middleware mode and the SSR entry
 * is loaded via `ssrLoadModule` for HMR-friendly rendering. In
 * `production`, the pre-built client assets are served from
 * `<clientRoot>/dist/client` and the pre-built server bundle is
 * imported from `<clientRoot>/dist/server/entry-server.js`.
 *
 * Async wiring (Vite createServer, consumer `setup`, the catch-all
 * route, and the final error handler) is attached to a promise on
 * `app.locals.ready`. `runApp` awaits this promise before listening,
 * so consumers using `runApp` don't need to think about it.
 */
export function configureApp(options: WebAppOptions = {}): Application {
  const {
    appName = 'web-app',
    clientRoot = process.cwd(),
    serverEntry = 'src/entry-server.tsx',
    templateHtml = 'index.html',
    staticDirectories = [],
    sessionSecret,
    setup,
    viteConfig: viteOverride,
  } = options;
  const mode = resolveMode(options);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(cors());
  app.use(morgan('combined'));

  app.use(requestTracing);

  if (sessionSecret) {
    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
          httpOnly: true,
          maxAge: 3600000,
        },
      })
    );
  }

  app.get('/health', createHealthCheck(appName));

  app.locals.ready = (async () => {
    if (setup) {
      await Promise.resolve(setup(app));
    }

    if (mode === 'development') {
      const vite = await import('vite');
      const baseConfig: InlineConfig = {
        root: clientRoot,
        appType: 'custom',
        server: { middlewareMode: true },
      };
      const merged = viteOverride
        ? vite.mergeConfig(baseConfig, viteOverride)
        : baseConfig;
      const viteServer: ViteDevServer = await vite.createServer({
        ...merged,
        server: { ...(merged.server ?? {}), middlewareMode: true },
        appType: 'custom',
      });
      app.use(viteServer.middlewares);

      const templatePath = path.resolve(clientRoot, templateHtml);
      const serverEntryPath = path.resolve(clientRoot, serverEntry);

      app.get('*', async (req: Request, res: Response, next: NextFunction) => {
        try {
          const rawTemplate = await readTemplate(templatePath);
          const template = await viteServer.transformIndexHtml(
            req.originalUrl,
            rawTemplate
          );
          const mod = (await viteServer.ssrLoadModule(
            serverEntryPath
          )) as SsrEntryModule;
          const { html: appHtml, head: appHead = '' } = await mod.render(
            req.originalUrl
          );
          const html = injectTemplate(template, appHtml, appHead);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (err) {
          if (err instanceof Error) {
            viteServer.ssrFixStacktrace(err);
          }
          next(err);
        }
      });
    } else {
      const clientDist = path.join(clientRoot, 'dist', 'client');
      const serverBundle = path.join(
        clientRoot,
        'dist',
        'server',
        'entry-server.js'
      );
      const templatePath = path.join(clientDist, 'index.html');

      app.use(express.static(clientDist, { index: false }));
      for (const dir of staticDirectories) {
        app.use(express.static(path.resolve(clientRoot, dir)));
      }

      app.get('*', async (req: Request, res: Response, next: NextFunction) => {
        try {
          const template = await readTemplate(templatePath);
          const mod = (await import(
            pathToFileURL(serverBundle).href
          )) as SsrEntryModule;
          const { html: appHtml, head: appHead = '' } = await mod.render(
            req.originalUrl
          );
          const html = injectTemplate(template, appHtml, appHead);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (err) {
          next(err);
        }
      });
    }

    app.use(finalErrorHandler);
  })();

  return app;
}

export default configureApp;
