import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';
import { MonitoringService } from './monitoring.service';

const excludedHealthRoutes = new Set(['/api/health/live', '/api/health/ready']);

function resolveRoute(request: Request): string {
  const route: unknown = request.route;
  const routePath =
    typeof route === 'object' && route !== null && 'path' in route
      ? route.path
      : undefined;
  if (typeof routePath === 'string') {
    return `${request.baseUrl}${routePath}`;
  }
  return request.path;
}

@Catch()
@Injectable()
export class MonitoringExceptionFilter extends BaseExceptionFilter {
  constructor(
    httpAdapterHost: HttpAdapterHost,
    private readonly monitoringService: MonitoringService,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500 && !excludedHealthRoutes.has(request.path)) {
      this.monitoringService.captureException(exception, {
        requestId:
          typeof response.locals.requestId === 'string'
            ? response.locals.requestId
            : undefined,
        route: resolveRoute(request),
        method: request.method,
        status,
      });
    }

    super.catch(exception, host);
  }
}
