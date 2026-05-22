import type { NextFunction, Response } from 'express';
import { v4 as uuid } from 'uuid';
import type { ExtendedRequest } from '../types.js';

/**
 * Assigns a UUID to `req.id` if one isn't already set. Useful for
 * correlating logs across an inbound request lifecycle.
 */
export function requestTracing(
  req: ExtendedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.id) {
    req.id = uuid();
  }
  next();
}
