import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Express error-handling middleware.
 * Logs the error and sends an appropriate response. If the error
 * is not handled here, it forwards the error to the next handler by
 * calling `next(err)`.
 */
export default function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // log the error with our logger utility
  logger.error(err.stack || err.message || err);

  if (res.headersSent) {
    // If headers already sent, delegate to default express handler
    return next(err);
  }

  const status: number = err.status || err.statusCode || 500;
  const message: string = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      message,
      // expose stack on dev environment
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
