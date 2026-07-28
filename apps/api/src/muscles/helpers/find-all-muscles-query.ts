import { Prisma } from '../../../generated/prisma/client';

const muscleFindAllSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  bodyRegion: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  sortOrder: true,
} satisfies Prisma.MuscleSelect;

export function buildMusclesFindAllQuery(take: number, skip: number) {
  return {
    where: {
      isActive: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
      { createdAt: 'asc' },
      { id: 'asc' },
    ],
    take,
    skip,
    select: muscleFindAllSelect,
  } satisfies Prisma.MuscleFindManyArgs;
}
