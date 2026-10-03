import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError, ValidationError } from '../utils/errors.js';

type ErrorFields = Record<string, string[]>;

const createErrorEnvelope = (
  code: string,
  message: string,
  fields: ErrorFields = {},
) => ({ code, message, fields });

/**
 * Centralized error handler middleware.
 * Converts known error types into structured JSON responses
 * exposing the stable `{ error: { code, message, fields } }` envelope while
 * retaining legacy top-level fields for existing consumers.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle known application errors
  if (err instanceof AppError) {
    const fields = err instanceof ValidationError ? err.details ?? {} : {};
    const body: Record<string, unknown> = {
      message: err.message,
      error: createErrorEnvelope(err.code ?? 'INTERNAL_ERROR', err.message, fields),
    };

    if (err.code) {
      body.code = err.code;
    }

    if (err instanceof ValidationError) {
      // Keep the legacy fields while consumers migrate to the stable envelope.
      body.details = fields;
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
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        fields: flattened.fieldErrors,
      },
    } satisfies Record<string, unknown>);
    return;
  }

  // Handle multer errors (e.g. file exceeds 5MB limit) as 400, not 500
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      message: `Upload error: ${err.message}`,
      code: 'UPLOAD_ERROR',
      error: createErrorEnvelope('UPLOAD_ERROR', `Upload error: ${err.message}`),
    } satisfies Record<string, unknown>);
    return;
  }

  // Handle unknown errors
  // Deliberately log only request metadata. Never serialize the request, error
  // stack, authorization headers, cookies, or request body.
  console.error('Unhandled request failure', {
    method: req.method,
    path: req.path,
    status: 500,
  });
  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    error: createErrorEnvelope('INTERNAL_ERROR', 'Internal server error'),
  } satisfies Record<string, unknown>);
}
