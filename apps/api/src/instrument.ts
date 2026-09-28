import * as Sentry from '@sentry/nestjs';
import { sanitizeMonitoringEvent } from './modules/shared/infrastructure/monitoring/monitoring-event';

if (process.env.NODE_ENV === 'production') {
  const dsn = process.env.SENTRY_DSN?.trim();
  const release = process.env.COMMIT_SHA?.trim();

  if (!dsn) {
    throw new Error('SENTRY_DSN is required in production.');
  }
  if (!release) {
    throw new Error('COMMIT_SHA is required in production.');
  }

  Sentry.init({
    dsn,
    environment: 'production',
    release,
    maxBreadcrumbs: 0,
    tracesSampleRate: 0,
    beforeSend: sanitizeMonitoringEvent,
  });
}
