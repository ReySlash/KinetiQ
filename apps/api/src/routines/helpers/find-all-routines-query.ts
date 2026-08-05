import { Prisma } from '../../../generated/prisma/client';

const routineFindAllSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      exercises: true,
    },
  },
} satisfies Prisma.RoutineSelect;

type RoutineFindAllRow = Prisma.RoutineGetPayload<{
  select: typeof routineFindAllSelect;
}>;

type BuildRoutinesFindAllQueryParams = {
  take: number;
  skip: number;
  search?: string;
  sort?: 'name:asc' | 'name:desc' | 'updatedAt:asc' | 'updatedAt:desc';
  ownerId?: string;
  scope: 'my' | 'global';
};

function buildRoutinesWhere(
  ownerId: string | undefined,
  scope: 'my' | 'global',
  search?: string,
): Prisma.RoutineWhereInput {
  const normalizedSearch = search?.trim();
  if (scope === 'my' && !ownerId) {
    throw new Error('An owner is required for the my-routines scope.');
  }
  const where: Prisma.RoutineWhereInput =
    scope === 'global' ? { visibility: 'GLOBAL' } : { ownerId };

  if (!normalizedSearch) return where;

  return {
    ...where,
    OR: [
      { name: { contains: normalizedSearch, mode: 'insensitive' } },
      { description: { contains: normalizedSearch, mode: 'insensitive' } },
    ],
  };
}

export function buildRoutinesFindAllQuery({
  take,
  skip,
  search,
  sort = 'updatedAt:desc',
  ownerId,
  scope,
}: BuildRoutinesFindAllQueryParams) {
  const [field, direction] = sort.split(':') as [
    'name' | 'updatedAt',
    'asc' | 'desc',
  ];

  return {
    take,
    skip,
    select: routineFindAllSelect,
    where: buildRoutinesWhere(ownerId, scope, search),
    orderBy: [{ [field]: direction }, { id: 'asc' }],
  } satisfies Prisma.RoutineFindManyArgs;
}

export function mapRoutinesFindAllRows(routines: RoutineFindAllRow[]) {
  return routines.map(({ _count, ...routine }) => ({
    ...routine,
    exerciseCount: _count.exercises,
  }));
}
