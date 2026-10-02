import type { NextFunction, Request, Response } from 'express';
import { errorHandler } from '../middleware/errorHandler.middleware';
import { NotFoundError } from '../utils/errors';

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

const createResponse = (): MockResponse => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as MockResponse;
  response.status.mockReturnValue(response);
  return response;
};

const createRequest = (): Request => ({
  method: 'POST',
  path: '/api/auth/login',
  headers: {
    authorization: 'Bearer redacted-token',
    cookie: 'admin_session=session-value',
  },
  body: {
    password: 'password-value',
    requestSecret: 'request-secret-value',
  },
} as unknown as Request);

describe('error handler security contract', () => {
  it('normalizes known errors to the stable error envelope', () => {
    const response = createResponse();

    errorHandler(
      new NotFoundError('Resource missing'),
      createRequest(),
      response,
      jest.fn() as NextFunction,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Resource missing',
      code: 'NOT_FOUND',
      error: {
        code: 'NOT_FOUND',
        message: 'Resource missing',
        fields: {},
      },
    });
  });

  it('redacts bearer tokens, cookies, passwords, and request secrets from unknown-error logs', () => {
    const response = createResponse();
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(
      new Error('unexpected failure'),
      createRequest(),
      response,
      jest.fn() as NextFunction,
    );

    const recordedLog = JSON.stringify(logSpy.mock.calls);
    expect(recordedLog).not.toContain('redacted-token');
    expect(recordedLog).not.toContain('session-value');
    expect(recordedLog).not.toContain('password-value');
    expect(recordedLog).not.toContain('request-secret-value');
    expect(response.json).toHaveBeenCalledWith({
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        fields: {},
      },
    });

    logSpy.mockRestore();
  });
});
