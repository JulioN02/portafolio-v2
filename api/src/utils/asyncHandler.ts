import { type Request, type Response, type NextFunction } from 'express';

/**
 * Wraps async Express route handlers to catch rejected promises
 * and forward them to the error handler middleware.
 * Required for Express 4 which does not catch async errors automatically.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
