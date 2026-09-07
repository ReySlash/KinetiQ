import { Prisma } from '../../../../../generated/prisma/client';
import type { AnalyticsSourceSession } from '../../application/models/analytics-overview.model';

export const analyticsOverviewSelect = {
  id: true,
  startedAt: true,
  createdAt: true,
  completedAt: true,
  cancelledAt: true,
  performances: {
    orderBy: { order: 'asc' },
    select: {
      exerciseId: true,
      exerciseNameSnapshot: true,
      completedSets: {
        orderBy: { order: 'asc' },
        select: {
          repetitions: true,
          loadKg: true,
          isWarmup: true,
        },
      },
    },
  },
} satisfies Prisma.WorkoutSessionSelect;

type AnalyticsOverviewRow = Prisma.WorkoutSessionGetPayload<{
  select: typeof analyticsOverviewSelect;
}>;

export function toAnalyticsSourceSession(
  row: AnalyticsOverviewRow,
): AnalyticsSourceSession {
  const session: AnalyticsSourceSession = {
    id: row.id,
    startedAt: row.startedAt,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    performances: row.performances.map((performance) => ({
      exerciseId: performance.exerciseId,
      exerciseNameSnapshot: performance.exerciseNameSnapshot,
      completedSets: performance.completedSets.map((set) => ({
        repetitions: set.repetitions,
        loadKg: set.loadKg.toString(),
        isWarmup: set.isWarmup,
      })),
    })),
  };
  return session;
}
