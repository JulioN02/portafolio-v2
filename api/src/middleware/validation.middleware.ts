import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates the given request part against a ZodSchema.
 * On failure, ZodErrors are forwarded to the central errorHandler so the
 * response keeps the canonical `{ message, code, details }` shape.
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;
      const parsed = schema.parse(data);
      
      if (target === 'body') {
        req.body = parsed;
      } else if (target === 'query') {
        (req as any).validatedQuery = parsed;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Pre-built validators for common use cases
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');