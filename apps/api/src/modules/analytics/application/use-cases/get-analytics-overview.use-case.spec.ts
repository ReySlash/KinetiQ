import {
  AnalyticsQueryError,
  AnalyticsValidationError,
} from '../errors/analytics.errors';
import type {
  AnalyticsOverview,
  AnalyticsSourceSession,
} from '../models/analytics-overview.model';
import { AnalyticsQueryPort } from '../ports/analytics-query.port';
import { GetAnalyticsOverviewUseCase } from './get-analytics-overview.use-case';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';

const emptyOverview: AnalyticsOverview = {
  period: {
    from: '2026-01-05T00:00:00.000Z',
    to: '2026-01-12T00:00:00.000Z',
    timezone: 'UTC',
    includesPartialCurrentWeek: false,
  },
  totals: {
    completedWorkouts: 0,
    trainingDays: 0,
    completedWorkingSets: 0,
    warmupSets: 0,
    totalRepetitions: 0,
    volumeLoadKg: null,
    activeWeeks: 0,
    completeWeeks: 1,
    averageWorkoutsPerCompleteWeek: 0,
  },
  volumeCompleteness: {
    status: 'UNAVAILABLE',
    includedSetCount: 0,
    excludedSetCount: 0,
  },
  weekly: [],
  exercises: [],
  recentWorkouts: [],
  comparison: {
    period: {
      from: '2025-12-29T00:00:00.000Z',
      to: '2026-01-04T23:59:59.999Z',
    },
    totals: {
      completedWorkouts: 0,
      trainingDays: 0,
      completedWorkingSets: 0,
      warmupSets: 0,
      totalRepetitions: 0,
      volumeLoadKg: null,
      activeWeeks: 0,
      completeWeeks: 1,
      averageWorkoutsPerCompleteWeek: 0,
    },
    volumeCompleteness: {
      status: 'UNAVAILABLE',
      includedSetCount: 0,
      excludedSetCount: 0,
    },
  },
};

describe('GetAnalyticsOverviewUseCase', () => {
  it('resolves the query, fetches trusted completed sessions, and calculates the overview', async () => {
    // Failure modes: BV-01, BV-07
    // Arrange
    const findCompletedSessions = jest
      .fn<Promise<AnalyticsSourceSession[]>, [unknown]>()
      .mockResolvedValue([]);
    const port = { findCompletedSessions } as unknown as AnalyticsQueryPort;
    const useCase = new GetAnalyticsOverviewUseCase(port);
    const query = {
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    };

    // Act
    const overview = await useCase.execute(query);

    // Assert
    expect(findCompletedSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId,
        from: query.from,
        to: query.to,
        timezone: 'UTC',
      }),
    );
    expect(overview.period).toEqual({
      from: query.from.toISOString(),
      to: query.to.toISOString(),
      timezone: 'UTC',
      includesPartialCurrentWeek: false,
    });
  });

  it('rejects invalid ranges before querying the analytics port', async () => {
    // Failure mode: BC-01
    // Arrange
    const findCompletedSessions = jest.fn();
    const port = { findCompletedSessions } as unknown as AnalyticsQueryPort;
    const useCase = new GetAnalyticsOverviewUseCase(port);

    // Act
    const action = useCase.execute({
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-12T00:00:00.000Z'),
      to: new Date('2026-01-05T00:00:00.000Z'),
    });

    // Assert
    await expect(action).rejects.toBeInstanceOf(AnalyticsValidationError);
    expect(findCompletedSessions).not.toHaveBeenCalled();
  });

  it('propagates a persisted-data query failure without converting it to validation', async () => {
    // Failure mode: BV-05
    // Arrange
    const findCompletedSessions = jest
      .fn<Promise<AnalyticsSourceSession[]>, [unknown]>()
      .mockResolvedValue([
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          startedAt: new Date('2026-01-06T12:00:00.000Z'),
          createdAt: new Date('2026-01-06T12:00:00.000Z'),
          completedAt: new Date('2026-01-06T13:00:00.000Z'),
          cancelledAt: null,
          performances: [
            {
              exerciseId: '423e4567-e89b-12d3-a456-426614174000',
              exerciseSlug: 'bench-press',
              exerciseNameSnapshot: 'Bench Press',
              completedSets: [
                { repetitions: 8, loadKg: 'invalid', isWarmup: false },
              ],
            },
          ],
        },
      ]);
    const port = { findCompletedSessions } as unknown as AnalyticsQueryPort;
    const useCase = new GetAnalyticsOverviewUseCase(port);

    // Act
    const action = useCase.execute({
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    });

    // Assert
    await expect(action).rejects.toBeInstanceOf(AnalyticsQueryError);
  });

  it('calculates a stable empty overview for an empty source result', async () => {
    // Failure mode: NE-03
    // Arrange
    const findCompletedSessions = jest
      .fn<Promise<AnalyticsSourceSession[]>, [unknown]>()
      .mockResolvedValue([]);
    const port = { findCompletedSessions } as unknown as AnalyticsQueryPort;
    const useCase = new GetAnalyticsOverviewUseCase(port);

    // Act
    const overview = await useCase.execute({
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    });

    // Assert
    expect(overview.totals.volumeLoadKg).toBeNull();
    expect(overview.volumeCompleteness.status).toBe('UNAVAILABLE');
    expect(overview.exercises).toEqual(emptyOverview.exercises);
  });

  it('loads an immediately preceding comparison period with the same owner and local duration', async () => {
    const findCompletedSessions = jest
      .fn<Promise<AnalyticsSourceSession[]>, [unknown]>()
      .mockResolvedValue([]);
    const useCase = new GetAnalyticsOverviewUseCase({
      findCompletedSessions,
    } as unknown as AnalyticsQueryPort);

    const overview = await useCase.execute({
      ownerId,
      timezone: 'UTC',
      from: new Date('2026-01-05T00:00:00.000Z'),
      to: new Date('2026-01-12T00:00:00.000Z'),
    });

    expect(findCompletedSessions).toHaveBeenCalledTimes(2);
    expect(findCompletedSessions).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ownerId,
        timezone: 'UTC',
        from: new Date('2025-12-29T00:00:00.000Z'),
        to: new Date('2026-01-04T23:59:59.999Z'),
      }),
    );
    expect(overview.comparison.period).toEqual({
      from: '2025-12-29T00:00:00.000Z',
      to: '2026-01-04T23:59:59.999Z',
    });
  });
});
