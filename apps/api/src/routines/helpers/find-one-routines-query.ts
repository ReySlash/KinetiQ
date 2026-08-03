import { Prisma } from '../../../generated/prisma/client';

export const routineFindOneSelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  exercises: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      exerciseId: true,
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

export function buildRoutinesFindOneQuery(id: string, ownerId: string) {
  return {
    select: routineFindOneSelect,
    where: { id, ownerId },
  } satisfies Prisma.RoutineFindFirstArgs;
}
