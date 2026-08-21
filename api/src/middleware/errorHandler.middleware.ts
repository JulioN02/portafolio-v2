import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError, ValidationError } from '../utils/errors.js';

/**
 * Centralized error handler middleware.
 * Converts known error types into structured JSON responses
 * matching the ApiError interface from @jsoft/shared:
 * `{ message: string; code?: string; details?: Record<string, string[]> }`
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle known application errors
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      message: err.message,
    };

    if (err.code) {
      body.code = err.code;
    }

    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const flattened = err.flatten();
    res.status(400).json({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: flattened.fieldErrors,
    } satisfies Record<string, unknown>);
    return;
  }

  // Handle multer errors (e.g. file exceeds 5MB limit) as 400, not 500
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      message: `Upload error: ${err.message}`,
      code: 'UPLOAD_ERROR',
    } satisfies Record<string, unknown>);
    return;
  }

  // Handle unknown errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  } satisfies Record<string, unknown>);
}
