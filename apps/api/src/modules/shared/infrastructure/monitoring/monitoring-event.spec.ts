import type { ErrorEvent } from '@sentry/nestjs';
import { sanitizeMonitoringEvent } from './monitoring-event';

describe('sanitizeMonitoringEvent', () => {
  it('keeps diagnostic stack data while removing sensitive request context', () => {
    const event = {
      event_id: 'event-1',
      environment: 'production',
      release: 'abc123',
      message: 'failed for private@example.com',
      user: { id: 'user-1', email: 'private@example.com' },
      request: {
        url: 'https://api.example.com/api/routines?search=private',
        headers: { authorization: 'Bearer secret', cookie: 'session=secret' },
        data: { notes: 'private health note' },
      },
      breadcrumbs: [{ message: 'submitted private form' }],
      extra: { completedSet: { repetitions: 10 } },
      contexts: {
        runtime: { name: 'node', version: '24' },
        account: { email: 'private@example.com' },
      },
      tags: {
        route: '/api/routines',
        requestId: 'request-1',
        'http.method': 'GET',
        'http.status_code': '500',
        private: 'drop-me',
      },
      exception: {
        values: [
          {
            type: 'Error',
            value: 'query failed for private@example.com',
            stacktrace: {
              frames: [
                {
                  filename: 'routines.service.ts',
                  lineno: 10,
                  vars: { email: 'private@example.com' },
                },
              ],
            },
          },
        ],
      },
    } as unknown as ErrorEvent;

    const sanitized = sanitizeMonitoringEvent(event);

    expect(sanitized.message).toBeUndefined();
    expect(sanitized.user).toBeUndefined();
    expect(sanitized.request).toBeUndefined();
    expect(sanitized.breadcrumbs).toBeUndefined();
    expect(sanitized.extra).toBeUndefined();
    expect(sanitized.contexts).toEqual({
      runtime: { name: 'node', version: '24' },
    });
    expect(sanitized.tags).toEqual({
      route: '/api/routines',
      requestId: 'request-1',
      'http.method': 'GET',
      'http.status_code': '500',
    });
    expect(sanitized.exception?.values?.[0]?.value).toBe('Production error');
    expect(
      sanitized.exception?.values?.[0]?.stacktrace?.frames?.[0]?.vars,
    ).toBeUndefined();
  });
});
