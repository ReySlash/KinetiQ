import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  type INestApplication,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import type { Server } from 'node:http';
import request from 'supertest';
import { MonitoringExceptionFilter } from './monitoring-exception.filter';
import { MonitoringService } from './monitoring.service';

@Controller()
class MonitoringTestController {
  @Get('bad-request')
  badRequest(): never {
    throw new BadRequestException('invalid input');
  }

  @Get('controlled-failure')
  controlledFailure(): never {
    throw new InternalServerErrorException('request failed', {
      cause: new Error('database unavailable'),
    });
  }

  @Get('unexpected-failure')
  unexpectedFailure(): never {
    throw new Error('unexpected failure');
  }

  @Get('api/health/live')
  healthFailure(): never {
    throw new InternalServerErrorException('health failed');
  }

  @Get('api/health/ready')
  readinessFailure(): never {
    throw new InternalServerErrorException('readiness failed');
  }
}

describe('MonitoringExceptionFilter', () => {
  let app: INestApplication;
  const captureException = jest.fn();

  beforeEach(async () => {
    captureException.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [MonitoringTestController],
      providers: [
        {
          provide: MonitoringService,
          useValue: { captureException },
        },
        {
          provide: APP_FILTER,
          useClass: MonitoringExceptionFilter,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((_request: Request, response: Response, next: NextFunction) => {
      response.locals.requestId = 'request-1';
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('captures controlled and unexpected 500 failures once', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/controlled-failure').expect(500, {
      statusCode: 500,
      message: 'request failed',
    });
    await request(server).get('/unexpected-failure').expect(500, {
      statusCode: 500,
      message: 'Internal server error',
    });

    expect(captureException).toHaveBeenCalledTimes(2);
    expect(captureException).toHaveBeenNthCalledWith(
      1,
      expect.any(InternalServerErrorException),
      {
        requestId: 'request-1',
        route: '/controlled-failure',
        method: 'GET',
        status: 500,
      },
    );
    expect(captureException).toHaveBeenNthCalledWith(2, expect.any(Error), {
      requestId: 'request-1',
      route: '/unexpected-failure',
      method: 'GET',
      status: 500,
    });
  });

  it('does not capture 4xx responses or health failures', async () => {
    const server = app.getHttpServer() as Server;

    await request(server).get('/bad-request').expect(400);
    await request(server).get('/api/health/live').expect(500);
    await request(server).get('/api/health/ready').expect(500);

    expect(captureException).not.toHaveBeenCalled();
  });
});
