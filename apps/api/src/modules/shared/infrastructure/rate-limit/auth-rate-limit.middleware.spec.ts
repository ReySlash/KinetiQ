import type { NextFunction, Request, Response } from 'express';
import { AuthRateLimitMiddleware } from './auth-rate-limit.middleware';

type MockResponse = Response & { statusMock: jest.Mock };

function responseMock(): MockResponse {
  const headers = new Map<string, number>();
  const statusMock = jest.fn().mockReturnThis();
  return {
    headers,
    setHeader(name: string, value: number) {
      headers.set(name, value);
    },
    status: statusMock,
    json: jest.fn().mockReturnThis(),
    statusMock,
  } as unknown as MockResponse;
}

describe('AuthRateLimitMiddleware', () => {
  it('limits credential endpoints per IP and path', () => {
    const middleware = new AuthRateLimitMiddleware();
    const next = jest.fn() as NextFunction;

    for (let attempt = 0; attempt < 11; attempt += 1) {
      middleware.use(
        {
          ip: '127.0.0.1',
          originalUrl: '/api/auth/sign-in/email',
          url: '/api/auth/sign-in/email',
        } as Request,
        responseMock(),
        next,
      );
    }

    expect(next).toHaveBeenCalledTimes(10);
  });

  it('does not limit non-authentication routes', () => {
    const middleware = new AuthRateLimitMiddleware();
    const next = jest.fn() as NextFunction;
    const response = responseMock();

    middleware.use(
      {
        ip: '127.0.0.1',
        originalUrl: '/api/routines',
        url: '/api/routines',
      } as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.statusMock).not.toHaveBeenCalled();
  });
});
