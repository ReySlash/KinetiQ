import { Prisma } from '../../../generated/prisma/client';

const routineFindAllSelect = {
  id: true,
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
  ownerId: string;
};

function buildRoutinesWhere(
  ownerId: string,
  search?: string,
): Prisma.RoutineWhereInput {
  const normalizedSearch = search?.trim();
  const where: Prisma.RoutineWhereInput = { ownerId };

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
}: BuildRoutinesFindAllQueryParams) {
  const [field, direction] = sort.split(':') as [
    'name' | 'updatedAt',
    'asc' | 'desc',
  ];

  return {
    take,
    skip,
    select: routineFindAllSelect,
    where: buildRoutinesWhere(ownerId, search),
    orderBy: [{ [field]: direction }, { id: 'asc' }],
  } satisfies Prisma.RoutineFindManyArgs;
}

export function mapRoutinesFindAllRows(routines: RoutineFindAllRow[]) {
  return routines.map(({ _count, ...routine }) => ({
    ...routine,
    exerciseCount: _count.exercises,
  }));
}
