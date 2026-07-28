import { Prisma } from '../../../generated/prisma/client';

const exerciseFindOneSelect = {
  name: true,
  slug: true,
  description: true,
  instructions: true,
  commonMistakes: true,
  forceType: true,
  kineticChain: true,
  isCompound: true,
  laterality: true,
  contractionMode: true,
  bodyPosition: true,
  skillLevel: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  movementPattern: {
    select: {
      name: true,
      slug: true,
      description: true,
    },
  },
  capabilities: {
    select: {
      hypertrophyPotential: true,
      maximalStrengthPotential: true,
      powerDevelopmentPotential: true,
      muscularEndurancePotential: true,
      stabilityDevelopmentPotential: true,
      typicalLoadability: true,
      stretchPositionLoading: true,
      shortenedPositionLoading: true,
      editorialNotes: true,
    },
  },
  demands: {
    select: {
      technicalDemand: true,
      setupComplexity: true,
      stabilityDemand: true,
      systemicFatiguePotential: true,
      localFatiguePotential: true,
      recoveryCostPotential: true,
      gripDemand: true,
      axialLoadingPotential: true,
      editorialNotes: true,
    },
  },
  muscles: {
    select: {
      muscle: {
        select: {
          name: true,
          slug: true,
          thumbnailUrl: true,
          imageAltText: true,
        },
      },
    },
  },
  equipment: {
    where: {
      equipment: {
        isActive: true,
      },
    },
    select: {
      equipment: {
        select: {
          name: true,
          slug: true,
          description: true,
        },
      },
    },
  },
} satisfies Prisma.ExerciseSelect;

type ExerciseFindOneRow = Prisma.ExerciseGetPayload<{
  select: typeof exerciseFindOneSelect;
}>;

export function buildExercisesFindOneQuery(slug: string) {
  return {
    select: exerciseFindOneSelect,
    where: {
      slug,
      isActive: true,
    },
  } satisfies Prisma.ExerciseFindFirstArgs;
}

export function mapExerciseFindOneRow(exercise: ExerciseFindOneRow) {
  return {
    ...exercise,
    muscles: exercise.muscles.map(({ muscle }) => muscle),
    equipment: exercise.equipment.map(({ equipment }) => equipment),
  };
}
