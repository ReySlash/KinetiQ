import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/nestjs';
import { MonitoringService } from './monitoring.service';

const mockSetTag = jest.fn();

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
  withScope: jest.fn(),
}));

describe('MonitoringService', () => {
  const mockCaptureException = jest.mocked(Sentry.captureException);
  const mockWithScope = jest.mocked(Sentry.withScope);

  beforeEach(() => {
    mockSetTag.mockReset();
    mockCaptureException.mockReset();
    mockWithScope.mockReset();
    mockWithScope.mockImplementation((callback) =>
      callback({ setTag: mockSetTag }),
    );
  });

  async function createService(nodeEnv: string): Promise<MonitoringService> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => nodeEnv },
        },
      ],
    }).compile();

    return moduleRef.get(MonitoringService);
  }

  it('does not invoke Sentry outside production', async () => {
    const service = await createService('test');

    service.captureException(new Error('ignored'), {
      route: '/api/routines',
      method: 'GET',
      status: 500,
    });

    expect(mockWithScope).not.toHaveBeenCalled();
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('captures production failures with only the approved request context', async () => {
    const service = await createService('production');
    const error = new Error('database failed');

    service.captureException(error, {
      requestId: 'request-1',
      route: '/api/routines/:slug',
      method: 'PATCH',
      status: 500,
    });

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(mockCaptureException).toHaveBeenCalledWith(error);
    expect(mockSetTag.mock.calls).toEqual([
      ['runtime', 'api'],
      ['route', '/api/routines/:slug'],
      ['http.method', 'PATCH'],
      ['http.status_code', '500'],
      ['requestId', 'request-1'],
    ]);
  });

  it('does not propagate monitoring transport failures', async () => {
    const service = await createService('production');
    mockCaptureException.mockImplementationOnce(() => {
      throw new Error('monitoring unavailable');
    });

    expect(() =>
      service.captureException(new Error('application failed'), {
        route: '/api/routines',
        method: 'GET',
        status: 500,
      }),
    ).not.toThrow();
  });
});
