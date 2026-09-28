import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import type { EnvironmentVariables } from '../config/env.validation';

export type ApiMonitoringContext = {
  requestId?: string;
  route: string;
  method: string;
  status: number;
};

@Injectable()
export class MonitoringService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  captureException(exception: unknown, context: ApiMonitoringContext): void {
    if (this.configService.getOrThrow('NODE_ENV') !== 'production') {
      return;
    }

    try {
      Sentry.withScope((scope) => {
        scope.setTag('runtime', 'api');
        scope.setTag('route', context.route);
        scope.setTag('http.method', context.method);
        scope.setTag('http.status_code', String(context.status));
        if (context.requestId) {
          scope.setTag('requestId', context.requestId);
        }
        Sentry.captureException(exception);
      });
    } catch {
      // Monitoring must never replace or interrupt the application response.
    }
  }
}
