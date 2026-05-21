import type { Request, Response } from 'express';

/**
 * Build a simple liveness handler that reports `{ status: 'ok', appName }`.
 * Mounted automatically by `configureApp` at `/health`.
 */
export function createHealthCheck(appName: string) {
  return function healthCheck(_req: Request, res: Response): void {
    res.status(200).json({ status: 'ok', appName });
  };
}
