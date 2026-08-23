import type { NextFunction, Request, Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import { OriginCheckMiddleware } from './origin-check.middleware';

type MockResponse = Response & { statusMock: jest.Mock };

function responseMock(): MockResponse {
  const statusMock = jest.fn().mockReturnThis();
  return {
    status: statusMock,
    json: jest.fn().mockReturnThis(),
    statusMock,
  } as unknown as MockResponse;
}

function configMock(): ConfigService {
  return {
    get: jest.fn((key: string) => {
      if (key === 'BETTER_AUTH_URL') return 'https://api.kinetiq.test/api';
      if (key === 'WEB_ORIGIN') return 'https://app.kinetiq.test';
      if (key === 'PORT') return 3000;
      return undefined;
    }),
  } as unknown as ConfigService;
}

describe('OriginCheckMiddleware', () => {
  it('rejects unsafe requests from an untrusted origin', () => {
    const middleware = new OriginCheckMiddleware(configMock());
    const response = responseMock();
    const next = jest.fn() as NextFunction;

    middleware.use(
      {
        method: 'POST',
        get: () => 'https://evil.example',
      } as Request,
      response,
      next,
    );

    expect(response.statusMock).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 403,
      message: 'Request origin is not allowed.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['GET', 'HEAD', 'OPTIONS'])('allows safe %s requests', (method) => {
    const middleware = new OriginCheckMiddleware(configMock());
    const response = responseMock();
    const next = jest.fn() as NextFunction;

    middleware.use(
      { method, get: () => 'https://evil.example' } as Request,
      response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.statusMock).not.toHaveBeenCalled();
  });

  it('allows trusted origins and non-browser requests', () => {
    const middleware = new OriginCheckMiddleware(configMock());
    const next = jest.fn() as NextFunction;

    for (const origin of ['https://app.kinetiq.test', undefined]) {
      middleware.use(
        { method: 'POST', get: () => origin } as Request,
        responseMock(),
        next,
      );
    }

    expect(next).toHaveBeenCalledTimes(2);
  });
});
