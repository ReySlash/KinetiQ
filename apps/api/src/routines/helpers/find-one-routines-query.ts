import { Prisma } from '../../../generated/prisma/client';

export const routineFindOneSelect = {
  slug: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  exercises: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      exerciseSlug: true,
      order: true,
      sets: true,
      minReps: true,
      maxReps: true,
      targetRir: true,
      restSeconds: true,
      tempo: true,
      notes: true,
      exercise: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          archivedAt: true,
        },
      },
    },
  },
} satisfies Prisma.RoutineSelect;

export function buildRoutinesFindOneQuery(slug: string, ownerId?: string) {
  return {
    select: routineFindOneSelect,
    where: {
      slug,
      ...(ownerId
        ? { OR: [{ visibility: 'GLOBAL' as const }, { ownerId }] }
        : { visibility: 'GLOBAL' as const }),
    },
  } satisfies Prisma.RoutineFindFirstArgs;
}
