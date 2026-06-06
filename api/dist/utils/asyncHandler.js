/**
 * Wraps async Express route handlers to catch rejected promises
 * and forward them to the error handler middleware.
 * Required for Express 4 which does not catch async errors automatically.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
//# sourceMappingURL=asyncHandler.js.map