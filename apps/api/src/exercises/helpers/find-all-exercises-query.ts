import { Prisma } from '../../../generated/prisma/client';

const exerciseFindAllSelect = {
  name: true,
  slug: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  muscles: {
    select: {
      muscle: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.ExerciseSelect;

type ExerciseFindAllRow = Prisma.ExerciseGetPayload<{
  select: typeof exerciseFindAllSelect;
}>;

type BuildExercisesFindAllQueryParams = {
  take: number;
  skip: number;
  search?: string;
};

function buildExercisesWhere(search?: string): Prisma.ExerciseWhereInput {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return {
      isActive: true,
    };
  }

  return {
    isActive: true,
    OR: [
      {
        name: {
          contains: normalizedSearch,
          mode: 'insensitive',
        },
      },
      {
        slug: {
          contains: normalizedSearch,
          mode: 'insensitive',
        },
      },
      {
        muscles: {
          some: {
            muscle: {
              OR: [
                {
                  name: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
                {
                  slug: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        },
      },
    ],
  };
}

export function buildExercisesFindAllQuery({
  take,
  skip,
  search,
}: BuildExercisesFindAllQueryParams) {
  return {
    take,
    skip,
    select: exerciseFindAllSelect,
    where: buildExercisesWhere(search),
    orderBy: {
      name: 'asc',
    },
  } satisfies Prisma.ExerciseFindManyArgs;
}

export function mapExercisesFindAllRows(exercises: ExerciseFindAllRow[]) {
  return exercises.map((exercise) => ({
    ...exercise,
    muscles: exercise.muscles.map(({ muscle }) => muscle),
  }));
}
