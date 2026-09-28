import * as Sentry from "@sentry/nextjs";

export function captureWebException(exception: unknown): void {
  try {
    Sentry.captureException(exception);
  } catch {
    // Monitoring must never replace the user-facing error fallback.
  }
}
