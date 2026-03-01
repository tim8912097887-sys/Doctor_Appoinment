import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async express request handler and forwards any thrown errors
 * to the next() middleware (typically the error handler).
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => {
 *     // asynchronous code that may throw
 *   }));
 */
export function asyncHandler<T extends RequestHandler>(
  fn: T
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
