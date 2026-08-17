import { Prisma } from '../../../../generated/prisma/client';
import type { MuscleGroupDetail } from '../../application/models/detail-muscle-group.models';
import type { MuscleGroupListItem } from '../../application/models/list-muscle-groups.models';

export const muscleGroupListSelect = {
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

export const muscleGroupDetailSelect = {
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
    where: { isActive: true },
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
            select: { name: true },
          },
        },
      },
    },
  },
} satisfies Prisma.MuscleGroupSelect;

type PrismaMuscleGroupListItem = Prisma.MuscleGroupGetPayload<{
  select: typeof muscleGroupListSelect;
}>;

type PrismaMuscleGroupDetail = Prisma.MuscleGroupGetPayload<{
  select: typeof muscleGroupDetailSelect;
}>;

export function toListItem(
  row: PrismaMuscleGroupListItem,
): MuscleGroupListItem {
  return row;
}

export function toDetail(row: PrismaMuscleGroupDetail): MuscleGroupDetail {
  return row;
}
