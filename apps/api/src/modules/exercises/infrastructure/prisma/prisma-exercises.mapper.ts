import { Prisma } from '../../../../../generated/prisma/client';
import type { ExerciseDetail } from '../../application/models/detail-exercise.models';
import type {
  ExerciseListItem,
  ListExercisesQuery,
} from '../../application/models/list-exercises.models';
import { Exercise } from '../../domain/entities/exercise.entity';

export const exerciseFindAllSelect = {
  id: true,
  name: true,
  slug: true,
  skillLevel: true,
  thumbnailUrl: true,
  thumbnailStorageKey: true,
  imageAltText: true,
  muscles: {
    select: {
      muscle: { select: { name: true, slug: true } },
    },
  },
} satisfies Prisma.ExerciseSelect;

export const exerciseFindOneSelect = {
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
    select: { name: true, slug: true, description: true },
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
    where: { equipment: { isActive: true } },
    select: {
      equipment: { select: { name: true, slug: true, description: true } },
    },
  },
} satisfies Prisma.ExerciseSelect;

const exerciseAggregateSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  instructions: true,
  commonMistakes: true,
  movementPatternId: true,
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
  isActive: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  equipment: { select: { equipmentId: true } },
  muscles: {
    select: { muscleId: true, role: true, involvementScore: true, notes: true },
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
} satisfies Prisma.ExerciseSelect;

export type ExerciseAggregateRow = Prisma.ExerciseGetPayload<{
  select: typeof exerciseAggregateSelect;
}>;

export function buildExercisesFindAllQuery(query: ListExercisesQuery) {
  const search = query.search?.trim();
  const where: Prisma.ExerciseWhereInput = {
    isActive: true,
    ...(query.forceType ? { forceType: query.forceType } : {}),
    ...(query.laterality ? { laterality: query.laterality } : {}),
    ...(query.skillLevel ? { skillLevel: query.skillLevel } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            {
              muscles: {
                some: {
                  muscle: {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { slug: { contains: search, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  return {
    where,
    take: query.limit ?? 20,
    skip: query.offset ?? 0,
    orderBy: { name: 'asc' as const },
    select: exerciseFindAllSelect,
  } satisfies Prisma.ExerciseFindManyArgs;
}

export function toListItem(
  row: Prisma.ExerciseGetPayload<{ select: typeof exerciseFindAllSelect }>,
): ExerciseListItem {
  return { ...row, muscles: row.muscles.map(({ muscle }) => muscle) };
}

export function toDetail(
  row: Prisma.ExerciseGetPayload<{ select: typeof exerciseFindOneSelect }>,
): ExerciseDetail {
  return {
    ...row,
    movementPattern: row.movementPattern,
    capabilities: row.capabilities,
    demands: row.demands,
    muscles: row.muscles.map(({ muscle }) => muscle),
    equipment: row.equipment.map(({ equipment }) => equipment),
  };
}

export function toDomain(row: ExerciseAggregateRow): Exercise {
  return Exercise.reconstitute({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    instructions: row.instructions,
    commonMistakes: row.commonMistakes,
    movementPatternId: row.movementPatternId,
    forceType: row.forceType,
    kineticChain: row.kineticChain,
    isCompound: row.isCompound,
    laterality: row.laterality,
    contractionMode: row.contractionMode,
    bodyPosition: row.bodyPosition,
    skillLevel: row.skillLevel,
    thumbnailUrl: row.thumbnailUrl,
    thumbnailStorageKey: row.thumbnailStorageKey,
    imageAltText: row.imageAltText,
    isActive: row.isActive,
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    equipmentIds: row.equipment.map(({ equipmentId }) => equipmentId),
    muscles: row.muscles,
    capabilities: row.capabilities,
    demands: row.demands,
  });
}

export function toCreateData(
  exercise: Exercise,
): Prisma.ExerciseUncheckedCreateInput {
  const value = exercise.toValue();
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    description: value.description,
    instructions: value.instructions,
    commonMistakes: value.commonMistakes,
    movementPatternId: value.movementPatternId,
    forceType: value.forceType,
    kineticChain: value.kineticChain,
    isCompound: value.isCompound,
    laterality: value.laterality,
    contractionMode: value.contractionMode,
    bodyPosition: value.bodyPosition,
    skillLevel: value.skillLevel,
    thumbnailUrl: value.thumbnailUrl,
    thumbnailStorageKey: value.thumbnailStorageKey,
    imageAltText: value.imageAltText,
    isActive: value.isActive,
    archivedAt: value.archivedAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function toUpdateData(
  exercise: Exercise,
): Prisma.ExerciseUncheckedUpdateInput {
  const value = exercise.toValue();
  return {
    name: value.name,
    description: value.description,
    instructions: value.instructions,
    commonMistakes: value.commonMistakes,
    movementPatternId: value.movementPatternId,
    forceType: value.forceType,
    kineticChain: value.kineticChain,
    isCompound: value.isCompound,
    laterality: value.laterality,
    contractionMode: value.contractionMode,
    bodyPosition: value.bodyPosition,
    skillLevel: value.skillLevel,
    thumbnailUrl: value.thumbnailUrl,
    thumbnailStorageKey: value.thumbnailStorageKey,
    imageAltText: value.imageAltText,
  };
}

export { exerciseAggregateSelect };
