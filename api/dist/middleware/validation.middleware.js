import { ZodError } from 'zod';
export const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const data = target === 'body' ? req.body : target === 'query' ? req.query : req.params;
            const parsed = schema.parse(data);
            if (target === 'body') {
                req.body = parsed;
            }
            else if (target === 'query') {
                req.validatedQuery = parsed;
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.flatten().fieldErrors,
                });
                return;
            }
            next(error);
        }
    };
};
// Pre-built validators for common use cases
export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
//# sourceMappingURL=validation.middleware.js.map