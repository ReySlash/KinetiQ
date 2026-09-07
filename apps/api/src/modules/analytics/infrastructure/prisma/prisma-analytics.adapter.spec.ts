jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { AnalyticsQueryError } from '../../application/errors/analytics.errors';
import type { ResolvedAnalyticsOverviewQuery } from '../../application/ports/analytics-query.port';
import { PrismaAnalyticsAdapter } from './prisma-analytics.adapter';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';

function resolvedQuery(): ResolvedAnalyticsOverviewQuery {
  return {
    ownerId,
    timezone: 'UTC',
    from: new Date('2026-01-01T00:00:00.000Z'),
    to: new Date('2026-01-08T00:00:00.000Z'),
    includesPartialCurrentWeek: false,
  };
}

describe('PrismaAnalyticsAdapter', () => {
  it('filters by owner and completed status with inclusive range boundaries', async () => {
    // Failure modes: EC-01, EC-08, BV-01, BV-07, BC-02
    // Arrange
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      workoutSession: { findMany },
    } as unknown as PrismaService;
    const adapter = new PrismaAnalyticsAdapter(prisma);
    const query = resolvedQuery();

    // Act
    await adapter.findCompletedSessions(query);

    // Assert
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId,
          status: 'COMPLETED',
          startedAt: { gte: query.from, lte: query.to },
        },
      }),
    );
  });

  it('maps persisted sessions and nested decimal loads through the analytics source shape', async () => {
    // Failure modes: EC-03, EC-06, EC-09
    // Arrange
    const findMany = jest.fn().mockResolvedValue([
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        startedAt: new Date('2026-01-06T12:00:00.000Z'),
        createdAt: new Date('2026-01-06T12:05:00.000Z'),
        completedAt: new Date('2026-01-06T13:00:00.000Z'),
        cancelledAt: null,
        performances: [
          {
            exerciseId: '423e4567-e89b-12d3-a456-426614174000',
            exerciseNameSnapshot: 'Bench Press',
            completedSets: [
              {
                repetitions: 8,
                loadKg: { toString: () => '100.25' },
                isWarmup: false,
              },
            ],
          },
        ],
      },
    ]);
    const prisma = {
      workoutSession: { findMany },
    } as unknown as PrismaService;
    const adapter = new PrismaAnalyticsAdapter(prisma);

    // Act
    const sessions = await adapter.findCompletedSessions(resolvedQuery());

    // Assert
    expect(sessions).toEqual([
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        startedAt: new Date('2026-01-06T12:00:00.000Z'),
        createdAt: new Date('2026-01-06T12:05:00.000Z'),
        completedAt: new Date('2026-01-06T13:00:00.000Z'),
        cancelledAt: null,
        performances: [
          {
            exerciseId: '423e4567-e89b-12d3-a456-426614174000',
            exerciseNameSnapshot: 'Bench Press',
            completedSets: [
              { repetitions: 8, loadKg: '100.25', isWarmup: false },
            ],
          },
        ],
      },
    ]);
  });

  it('converts database failures into a stable analytics query error', async () => {
    // Failure mode: BV-06
    // Arrange
    const findMany = jest.fn().mockRejectedValue(new Error('database failed'));
    const prisma = {
      workoutSession: { findMany },
    } as unknown as PrismaService;
    const adapter = new PrismaAnalyticsAdapter(prisma);

    // Act
    const action = adapter.findCompletedSessions(resolvedQuery());

    // Assert
    await expect(action).rejects.toBeInstanceOf(AnalyticsQueryError);
  });
});
