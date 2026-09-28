import type { ErrorEvent } from '@sentry/nextjs';
import { describe, expect, it } from 'vitest';
import { sanitizeMonitoringEvent } from '@/lib/monitoring/event';

describe('sanitizeMonitoringEvent', () => {
  it('keeps a query-free route and stack while dropping browser data', () => {
    const event = {
      message: 'failed for private@example.com',
      user: { email: 'private@example.com' },
      request: {
        url: 'https://kinetiq.example/routines?search=private#details',
        headers: { cookie: 'secret' },
        data: { notes: 'private note' },
      },
      breadcrumbs: [{ message: 'typed private value' }],
      extra: { form: { email: 'private@example.com' } },
      contexts: {
        runtime: { name: 'browser' },
        device: { name: 'Personal phone' },
      },
      tags: { private: 'drop-me' },
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'private form value',
            stacktrace: {
              frames: [{ filename: 'page.tsx', lineno: 20, vars: { email: 'private@example.com' } }],
            },
          },
        ],
      },
    } as unknown as ErrorEvent;

    const sanitized = sanitizeMonitoringEvent(event, 'web');

    expect(sanitized.request).toBeUndefined();
    expect(sanitized.user).toBeUndefined();
    expect(sanitized.breadcrumbs).toBeUndefined();
    expect(sanitized.extra).toBeUndefined();
    expect(sanitized.tags).toEqual({ route: '/routines', runtime: 'web' });
    expect(sanitized.contexts).toEqual({ runtime: { name: 'browser' } });
    expect(sanitized.exception?.values?.[0]?.value).toBe('Production error');
    expect(
      sanitized.exception?.values?.[0]?.stacktrace?.frames?.[0]?.vars,
    ).toBeUndefined();
  });
});
