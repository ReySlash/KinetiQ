import { Prisma } from '../../../../../generated/prisma/client';
import type { AnalyticsSourceSession } from '../../application/models/analytics-overview.model';

export const analyticsOverviewSelect = {
  id: true,
  sourceRoutineNameSnapshot: true,
  startedAt: true,
  createdAt: true,
  completedAt: true,
  cancelledAt: true,
  performances: {
    orderBy: { order: 'asc' },
    select: {
      exerciseId: true,
      exercise: { select: { slug: true } },
      exerciseNameSnapshot: true,
      completedSets: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          repetitions: true,
          loadKg: true,
          isWarmup: true,
          completedAt: true,
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
    sourceRoutineNameSnapshot: row.sourceRoutineNameSnapshot,
    startedAt: row.startedAt,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    performances: row.performances.map((performance) => ({
      exerciseId: performance.exerciseId,
      exerciseSlug: performance.exercise.slug,
      exerciseNameSnapshot: performance.exerciseNameSnapshot,
      completedSets: performance.completedSets.map((set) => ({
        id: set.id,
        order: set.order,
        repetitions: set.repetitions,
        loadKg: set.loadKg.toString(),
        isWarmup: set.isWarmup,
        completedAt: set.completedAt,
      })),
    })),
  };
  return session;
}
