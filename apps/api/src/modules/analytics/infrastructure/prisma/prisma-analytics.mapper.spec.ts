import { Prisma } from '../../../../../generated/prisma/client';
import type { AnalyticsSourceSession } from '../../application/models/analytics-overview.model';
import {
  analyticsOverviewSelect,
  toAnalyticsSourceSession,
} from './prisma-analytics.mapper';

describe('Prisma analytics mapper', () => {
  it('selects and maps only the historical fields required by analytics', () => {
    // Failure modes: EC-02, EC-03, EC-06, EC-09
    // Arrange
    const row = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      sourceRoutineNameSnapshot: 'Upper day',
      startedAt: new Date('2026-01-06T12:00:00.000Z'),
      createdAt: new Date('2026-01-06T12:05:00.000Z'),
      completedAt: new Date('2026-01-06T13:00:00.000Z'),
      cancelledAt: null,
      performances: [
        {
          exerciseId: '423e4567-e89b-12d3-a456-426614174000',
          exercise: { slug: 'bench-press' },
          exerciseNameSnapshot: 'Bench Press',
          completedSets: [
            {
              id: '523e4567-e89b-12d3-a456-426614174000',
              order: 0,
              repetitions: 8,
              loadKg: new Prisma.Decimal('100.25'),
              isWarmup: false,
              completedAt: new Date('2026-01-06T12:30:00.000Z'),
            },
            {
              id: '623e4567-e89b-12d3-a456-426614174000',
              order: 1,
              repetitions: 10,
              loadKg: new Prisma.Decimal('50.00'),
              isWarmup: true,
              completedAt: new Date('2026-01-06T12:35:00.000Z'),
            },
          ],
        },
      ],
    };

    // Act
    const mapped: AnalyticsSourceSession = toAnalyticsSourceSession(row);

    // Assert
    expect(mapped).toEqual({
      id: row.id,
      sourceRoutineNameSnapshot: 'Upper day',
      startedAt: row.startedAt,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
      cancelledAt: row.cancelledAt,
      performances: [
        {
          exerciseId: row.performances[0].exerciseId,
          exerciseSlug: 'bench-press',
          exerciseNameSnapshot: 'Bench Press',
          completedSets: [
            {
              id: '523e4567-e89b-12d3-a456-426614174000',
              order: 0,
              repetitions: 8,
              loadKg: '100.25',
              isWarmup: false,
              completedAt: new Date('2026-01-06T12:30:00.000Z'),
            },
            {
              id: '623e4567-e89b-12d3-a456-426614174000',
              order: 1,
              repetitions: 10,
              loadKg: '50',
              isWarmup: true,
              completedAt: new Date('2026-01-06T12:35:00.000Z'),
            },
          ],
        },
      ],
    });
    expect(analyticsOverviewSelect.id).toBe(true);
    expect(analyticsOverviewSelect.startedAt).toBe(true);
    // Failure mode: #353
    expect(analyticsOverviewSelect.createdAt).toBe(true);
  });

  it('projects lifecycle timestamps needed to validate completed-session integrity', () => {
    // Failure mode: BV-13
    // Arrange

    // Act
    const projection = analyticsOverviewSelect;

    // Assert
    expect(projection).toHaveProperty('completedAt', true);
    expect(projection).toHaveProperty('cancelledAt', true);
  });
});
