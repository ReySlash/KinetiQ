import { Prisma } from '../../../generated/prisma/client';

const muscleGroupFindAllSelect = {
  name: true,
  slug: true,
  description: true,
  sortOrder: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  muscles: {
    select: {
      name: true,
      bodyRegion: true,
    },
  },
} satisfies Prisma.MuscleGroupSelect;

export function buildMuscleGroupsFindAllQuery() {
  return {
    select: muscleGroupFindAllSelect,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  } satisfies Prisma.MuscleGroupFindManyArgs;
}
