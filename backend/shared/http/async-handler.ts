import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { isAppError } from './errors.js';

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch((error: unknown) => {
      if (isAppError(error)) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
          details: error.details,
        });
        return;
      }

      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Dados invalidos',
          code: 'VALIDATION_ERROR',
          details: error.issues,
        });
        return;
      }

      next(error);
    });
  };
}
