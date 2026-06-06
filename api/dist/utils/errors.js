export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
export class ValidationError extends AppError {
    details;
    constructor(message = 'Validation failed', details) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
        this.name = 'ValidationError';
    }
}
export class AuthError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
        this.name = 'AuthError';
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
//# sourceMappingURL=errors.js.map