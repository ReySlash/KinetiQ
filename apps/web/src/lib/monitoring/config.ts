type MonitoringEnvironment = Record<string, string | undefined>;

export type WebMonitoringBuildConfig = {
  enabled: boolean;
  dsn: string | undefined;
  release: string | undefined;
};

function requireValue(
  environment: MonitoringEnvironment,
  name: string,
): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for production error monitoring.`);
  }
  return value;
}

export function resolveWebMonitoringBuildConfig(
  environment: MonitoringEnvironment,
): WebMonitoringBuildConfig {
  if (environment.VERCEL_ENV !== "production") {
    return { enabled: false, dsn: undefined, release: undefined };
  }

  const dsn = requireValue(environment, "NEXT_PUBLIC_SENTRY_DSN");
  requireValue(environment, "SENTRY_AUTH_TOKEN");
  requireValue(environment, "SENTRY_ORG");
  requireValue(environment, "SENTRY_PROJECT");
  const release =
    environment.VERCEL_GIT_COMMIT_SHA?.trim() ||
    requireValue(environment, "COMMIT_SHA");

  return { enabled: true, dsn, release };
}

export function isWebMonitoringEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";
}
