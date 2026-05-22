import { describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Application, NextFunction, Request, Response } from 'express';
import { configureApp } from '../src/index.js';
import type { ExtendedRequest } from '../src/index.js';

interface SessionRequest extends Request {
  session?: unknown;
}

async function ready(app: Application): Promise<Application> {
  const pending = (app.locals as { ready?: Promise<unknown> }).ready;
  if (pending) {
    await pending;
  }
  return app;
}

describe('configureApp', () => {
  it('responds on /health with the configured appName', async () => {
    const app = await ready(
      configureApp({ appName: 'test-app', mode: 'production' })
    );
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', appName: 'test-app' });
  });

  it('attaches a uuid to req.id via requestTracing', async () => {
    let captured: string | undefined;
    const app = await ready(
      configureApp({
        mode: 'production',
        setup: (instance) => {
          instance.get('/_probe/id', (req: ExtendedRequest, res: Response) => {
            captured = req.id;
            res.json({ id: req.id ?? null });
          });
        },
      })
    );
    const res = await request(app).get('/_probe/id');
    expect(res.status).toBe(200);
    expect(typeof res.body.id).toBe('string');
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(captured).toBe(res.body.id);
  });

  it('does not mount express-session when sessionSecret is omitted', async () => {
    const app = await ready(
      configureApp({
        mode: 'production',
        setup: (instance) => {
          instance.get(
            '/_probe/session',
            (req: SessionRequest, res: Response) => {
              res.json({ hasSession: req.session !== undefined });
            }
          );
        },
      })
    );
    const res = await request(app).get('/_probe/session');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hasSession: false });
  });

  it('mounts express-session when sessionSecret is provided', async () => {
    const app = await ready(
      configureApp({
        mode: 'production',
        sessionSecret: 'shh-its-a-secret',
        setup: (instance) => {
          instance.get(
            '/_probe/session',
            (req: SessionRequest, res: Response) => {
              res.json({ hasSession: req.session !== undefined });
            }
          );
        },
      })
    );
    const res = await request(app).get('/_probe/session');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hasSession: true });
  });

  it('returns 500 from the catch-all when the prod template is missing', async () => {
    const app = await ready(
      configureApp({
        mode: 'production',
        clientRoot: '/tmp/__definitely_does_not_exist__',
        setup: (instance) => {
          // Swallow logs from the default error handler so the test stays quiet.
          instance.use(
            (err: Error, _req: Request, res: Response, _next: NextFunction) => {
              res.status(500).json({ message: err.message });
            }
          );
        },
      })
    );
    const res = await request(app).get('/some/page');
    expect(res.status).toBe(500);
    expect(typeof res.body.message).toBe('string');
  });
});
