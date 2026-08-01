import { Prisma } from '../../../generated/prisma/client';
import {
  ForceType,
  Laterality,
  SkillLevel,
} from '../../../generated/prisma/client';

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
  forceType?: ForceType;
  laterality?: Laterality;
  skillLevel?: SkillLevel;
};

function buildExercisesWhere(
  search?: string,
  forceType?: ForceType,
  laterality?: Laterality,
  skillLevel?: SkillLevel,
): Prisma.ExerciseWhereInput {
  const normalizedSearch = search?.trim();

  const where: Prisma.ExerciseWhereInput = {
    isActive: true,
  };

  if (forceType) {
    where.forceType = forceType;
  }

  if (laterality) {
    where.laterality = laterality;
  }

  if (skillLevel) {
    where.skillLevel = skillLevel;
  }

  if (!normalizedSearch) {
    return where;
  }

  return {
    ...where,
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
  forceType,
  laterality,
  skillLevel,
}: BuildExercisesFindAllQueryParams) {
  return {
    take,
    skip,
    select: exerciseFindAllSelect,
    where: buildExercisesWhere(search, forceType, laterality, skillLevel),
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
