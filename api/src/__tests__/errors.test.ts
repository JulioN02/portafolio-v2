import { AppError, NotFoundError, ValidationError, AuthError, ForbiddenError } from '../utils/errors';

describe('error classes', () => {
  it('AppError defaults to 500', () => {
    const err = new AppError('boom');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBeUndefined();
  });

  it('AppError accepts statusCode and code', () => {
    const err = new AppError('boom', 409, 'CONFLICT');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('boom');
  });

  it('NotFoundError uses 404 / NOT_FOUND', () => {
    const err = new NotFoundError();
    expect(err.name).toBe('NotFoundError');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
  });

  it('NotFoundError accepts a custom message', () => {
    expect(new NotFoundError('User missing').message).toBe('User missing');
  });

  it('ValidationError uses 400 / VALIDATION_ERROR and details', () => {
    const err = new ValidationError();
    expect(err.name).toBe('ValidationError');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toBeUndefined();
  });

  it('ValidationError stores details', () => {
    const err = new ValidationError('bad', { title: ['required'] });
    expect(err.details).toEqual({ title: ['required'] });
  });

  it('AuthError uses 401 / AUTH_ERROR', () => {
    const err = new AuthError();
    expect(err.name).toBe('AuthError');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTH_ERROR');
  });

  it('ForbiddenError uses 403 / FORBIDDEN', () => {
    const err = new ForbiddenError();
    expect(err.name).toBe('ForbiddenError');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Access denied');
  });

  it('error classes stay instanceof AppError', () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
    expect(new ValidationError()).toBeInstanceOf(AppError);
    expect(new AuthError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
  });
});