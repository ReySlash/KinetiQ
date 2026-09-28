import type { ErrorEvent } from '@sentry/nestjs';

const allowedTags = new Set([
  'route',
  'runtime',
  'requestId',
  'http.method',
  'http.status_code',
]);

function sanitizeException(
  exception: ErrorEvent['exception'],
): ErrorEvent['exception'] {
  if (!exception?.values) {
    return exception;
  }

  return {
    ...exception,
    values: exception.values.map((value) => ({
      type: value.type,
      value: 'Production error',
      mechanism: value.mechanism,
      stacktrace: value.stacktrace
        ? {
            ...value.stacktrace,
            frames: value.stacktrace.frames?.map((frame) => {
              const sanitizedFrame = { ...frame };
              delete sanitizedFrame.vars;
              return sanitizedFrame;
            }),
          }
        : undefined,
    })),
  };
}

function sanitizeTags(tags: ErrorEvent['tags']): ErrorEvent['tags'] {
  if (!tags) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(tags).filter(([name]) => allowedTags.has(name)),
  );
}

export function sanitizeMonitoringEvent(event: ErrorEvent): ErrorEvent {
  return {
    event_id: event.event_id,
    type: event.type,
    timestamp: event.timestamp,
    platform: event.platform,
    environment: event.environment,
    release: event.release,
    level: event.level,
    exception: sanitizeException(event.exception),
    tags: sanitizeTags(event.tags),
    contexts: event.contexts?.runtime
      ? { runtime: event.contexts.runtime }
      : undefined,
    debug_meta: event.debug_meta,
    sdk: event.sdk,
  };
}
