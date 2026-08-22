import { Prisma } from '../../../../../generated/prisma/client';
import type { RoutineDetail } from '../../application/models/detail-routine.model';
import type {
  ListRoutinesQuery,
  RoutineListItem,
} from '../../application/models/list-routines.model';
import { Routine } from '../../domain/entities/routine.entity';

export const routineFindAllSelect = {
  slug: true,
  name: true,
  description: true,
  visibility: true,
  updatedAt: true,
  _count: { select: { exercises: true } },
} satisfies Prisma.RoutineSelect;

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

export const routineAggregateSelect = {
  id: true,
  ownerId: true,
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
    },
  },
} satisfies Prisma.RoutineSelect;

export type RoutineAggregateRow = Prisma.RoutineGetPayload<{
  select: typeof routineAggregateSelect;
}>;

export function buildRoutinesFindAllQuery(query: ListRoutinesQuery) {
  const [field, direction] = query.sort.split(':') as [
    'name' | 'updatedAt',
    'asc' | 'desc',
  ];
  const scope =
    query.scope === 'global'
      ? { visibility: 'GLOBAL' as const }
      : { ownerId: query.ownerId, visibility: 'PRIVATE' as const };
  const search = query.q?.trim();

  return {
    take: query.limit,
    skip: query.offset,
    select: routineFindAllSelect,
    where: {
      ...scope,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              {
                description: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ [field]: direction }, { id: 'asc' as const }],
  } satisfies Prisma.RoutineFindManyArgs;
}

export function toListItem(
  row: Prisma.RoutineGetPayload<{ select: typeof routineFindAllSelect }>,
): RoutineListItem {
  const { _count, ...routine } = row;
  return { ...routine, exerciseCount: _count.exercises };
}

export function toDetail(
  row: Prisma.RoutineGetPayload<{ select: typeof routineFindOneSelect }>,
): RoutineDetail {
  return row;
}

export function toDomain(row: RoutineAggregateRow): Routine {
  return Routine.reconstitute({
    id: row.id,
    ownerId: row.ownerId,
    slug: row.slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    exercises: row.exercises,
  });
}

export function toCreateData(
  routine: Routine,
): Prisma.RoutineUncheckedCreateInput {
  const value = routine.toValue();
  return {
    id: value.id,
    ownerId: value.ownerId,
    slug: value.slug,
    name: value.name,
    description: value.description,
    visibility: value.visibility,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function toUpdateData(
  routine: Routine,
): Prisma.RoutineUncheckedUpdateInput {
  const value = routine.toValue();
  return {
    name: value.name,
    description: value.description,
  };
}

export function toExerciseCreateData(routine: Routine) {
  return routine.exercises.map((exercise) => exercise.toValue());
}
