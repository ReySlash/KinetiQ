import * as Sentry from "@sentry/nextjs";
import { isWebMonitoringEnabled } from "@/lib/monitoring/config";
import { sanitizeMonitoringEvent } from "@/lib/monitoring/event";

Sentry.init({
  enabled: isWebMonitoringEnabled(),
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: "production",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  maxBreadcrumbs: 0,
  tracesSampleRate: 0,
  beforeSend: (event) => sanitizeMonitoringEvent(event, "edge"),
});
