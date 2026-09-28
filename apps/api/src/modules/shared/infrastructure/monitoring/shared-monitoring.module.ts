import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { MonitoringExceptionFilter } from './monitoring-exception.filter';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [SentryModule.forRoot()],
  providers: [
    MonitoringService,
    {
      provide: APP_FILTER,
      useClass: MonitoringExceptionFilter,
    },
  ],
})
export class SharedMonitoringModule {}
