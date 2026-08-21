import { asyncHandler } from '../utils/asyncHandler';
import type { Request, Response, NextFunction } from 'express';

describe('asyncHandler', () => {
  const req = {} as Request;
  const res = {} as Response;
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  it('resolves the wrapped handler', async () => {
    const handler = jest.fn(async () => 42);
    const wrapped = asyncHandler(handler);

    wrapped(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejections to next', async () => {
    const err = new Error('route exploded');
    const handler = jest.fn(async () => {
      throw err;
    });
    const wrapped = asyncHandler(handler);

    wrapped(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalledWith(err);
  });

  it('catches synchronous throws inside async fn', async () => {
    const err = new Error('sync throw');
    const handler = jest.fn(async (): Promise<unknown> => {
      throw err;
    });
    const wrapped = asyncHandler(handler);

    wrapped(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalledWith(err);
  });
});