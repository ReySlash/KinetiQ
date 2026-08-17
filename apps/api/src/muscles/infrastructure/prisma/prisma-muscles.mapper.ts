import { Prisma } from '../../../../generated/prisma/client';
import type { MuscleDetails } from '../../application/models/get-muscles.models';
import type { MusclesListItem } from '../../application/models/list-muscles.models';
import type { Muscle } from '../../domain/entities/muscle.entity';

export const muscleListSelect = {
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

export const muscleDetailSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  bodyRegion: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  sortOrder: true,
  exerciseMuscles: {
    select: {
      exercise: {
        select: {
          name: true,
          slug: true,
          thumbnailUrl: true,
          imageAltText: true,
        },
      },
    },
  },
  functionAssignments: {
    select: {
      role: true,
      muscleFunction: {
        select: {
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  },
  muscleGroup: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.MuscleSelect;

export const muscleAggregateSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  bodyRegion: true,
  muscleGroupId: true,
  parentId: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MuscleSelect;

type PrismaMuscleListItem = Prisma.MuscleGetPayload<{
  select: typeof muscleListSelect;
}>;

type PrismaMuscleDetail = Prisma.MuscleGetPayload<{
  select: typeof muscleDetailSelect;
}>;

export function toListItem(row: PrismaMuscleListItem): MusclesListItem {
  return row;
}

export function toDetail(row: PrismaMuscleDetail): MuscleDetails {
  return {
    ...row,
    exerciseMuscles: row.exerciseMuscles.map(
      (exerciseMuscle) => exerciseMuscle.exercise,
    ),
  };
}

export function toCreateData(
  muscle: Muscle,
): Prisma.MuscleUncheckedCreateInput {
  const value = muscle.toValue();
  return value;
}

export function toUpdateData(
  muscle: Muscle,
): Prisma.MuscleUncheckedUpdateInput {
  return {
    name: muscle.name,
    description: muscle.description,
    bodyRegion: muscle.bodyRegion,
    muscleGroupId: muscle.muscleGroupId,
    parentId: muscle.parentId,
    thumbnailUrl: muscle.thumbnailUrl,
    thumbnailStorageKey: muscle.thumbnailStorageKey,
    imageAltText: muscle.imageAltText,
    sortOrder: muscle.sortOrder,
  };
}
