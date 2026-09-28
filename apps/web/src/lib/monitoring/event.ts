import type { ErrorEvent } from "@sentry/nextjs";

const allowedTags = new Set(["route", "runtime"]);

function getRoute(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    return new URL(url, "https://kinetiq.invalid").pathname;
  } catch {
    return undefined;
  }
}

function sanitizeException(
  exception: ErrorEvent["exception"],
): ErrorEvent["exception"] {
  if (!exception?.values) return exception;

  return {
    ...exception,
    values: exception.values.map((value) => ({
      type: value.type,
      value: "Production error",
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

export function sanitizeMonitoringEvent(
  event: ErrorEvent,
  runtime: "web" | "web-server" | "edge",
): ErrorEvent {
  const route = getRoute(event.request?.url);
  const tags = Object.fromEntries(
    Object.entries({ ...event.tags, ...(route ? { route } : {}), runtime }).filter(
      ([name]) => allowedTags.has(name),
    ),
  );

  return {
    event_id: event.event_id,
    type: event.type,
    timestamp: event.timestamp,
    platform: event.platform,
    environment: event.environment,
    release: event.release,
    level: event.level,
    exception: sanitizeException(event.exception),
    tags,
    contexts: event.contexts?.runtime
      ? { runtime: event.contexts.runtime }
      : undefined,
    debug_meta: event.debug_meta,
    sdk: event.sdk,
  };
}
