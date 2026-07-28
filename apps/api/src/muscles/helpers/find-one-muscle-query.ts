import { Prisma } from '../../../generated/prisma/client';

const muscleFindOneSelect = {
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

type MuscleFindOneRow = Prisma.MuscleGetPayload<{
  select: typeof muscleFindOneSelect;
}>;

export function buildMuscleFindOneQuery(slug: string) {
  return {
    where: {
      slug,
      isActive: true,
    },
    select: muscleFindOneSelect,
  } satisfies Prisma.MuscleFindFirstArgs;
}

export function mapMuscleFindOneRow(muscle: MuscleFindOneRow) {
  return {
    ...muscle,
    exerciseMuscles: muscle.exerciseMuscles.map(
      (exerciseMuscle) => exerciseMuscle.exercise,
    ),
  };
}
