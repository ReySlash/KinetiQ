import { describe, expect, it } from 'vitest';
import { resolveWebMonitoringBuildConfig } from '@/lib/monitoring/config';

describe('resolveWebMonitoringBuildConfig', () => {
  it('disables monitoring outside Vercel production', () => {
    expect(resolveWebMonitoringBuildConfig({ VERCEL_ENV: 'preview' })).toEqual({
      enabled: false,
      dsn: undefined,
      release: undefined,
    });
  });

  it('requires the DSN, source-map credentials, and release in production', () => {
    expect(() =>
      resolveWebMonitoringBuildConfig({ VERCEL_ENV: 'production' }),
    ).toThrow('NEXT_PUBLIC_SENTRY_DSN is required');
    expect(() =>
      resolveWebMonitoringBuildConfig({
        VERCEL_ENV: 'production',
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      }),
    ).toThrow('SENTRY_AUTH_TOKEN is required');
  });

  it('returns a production release tied to the deployed Git SHA', () => {
    expect(
      resolveWebMonitoringBuildConfig({
        VERCEL_ENV: 'production',
        NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
        SENTRY_AUTH_TOKEN: 'secret',
        SENTRY_ORG: 'kinetiq',
        SENTRY_PROJECT: 'kinetiq-web',
        VERCEL_GIT_COMMIT_SHA: 'abc123',
      }),
    ).toEqual({
      enabled: true,
      dsn: 'https://public@example.ingest.sentry.io/1',
      release: 'abc123',
    });
  });
});
