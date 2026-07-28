import { Prisma } from '../../../generated/prisma/client';

const muscleGroupFindOneSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  bodyRegion: true,
  muscles: {
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnailUrl: true,
      thumbnailStorageKey: true,
      imageAltText: true,
      functionAssignments: {
        select: {
          role: true,
          muscleFunction: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.MuscleGroupSelect;

export function buildMuscleGroupsFindOneQuery(slug: string) {
  return {
    where: {
      slug,
    },
    select: muscleGroupFindOneSelect,
  } satisfies Prisma.MuscleGroupFindUniqueArgs;
}
