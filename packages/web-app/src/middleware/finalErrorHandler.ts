import type { NextFunction, Request, Response } from 'express';

/**
 * Express error type with optional HTTP status. `express-openapi-validator`
 * and similar libraries set `err.status`; we honor it when present.
 */
interface HttpError extends Error {
  status?: number;
}

/**
 * Terminal error handler. Logs unstatused errors (assumed unexpected)
 * and responds with the error's status (or 500) plus a JSON body.
 * Must be registered last in the middleware chain.
 */
export function finalErrorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const status = typeof err.status === 'number' ? err.status : 500;
  if (!err.status) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ message: err.message });
}
