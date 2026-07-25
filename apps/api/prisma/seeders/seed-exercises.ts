import { randomUUID } from 'node:crypto';

import type { PrismaClient } from '../../generated/prisma/client';
import { exerciseCategories } from '../seed-data/exercises';
import type { ExerciseSeed } from '../seed-data/types';
import { getRequiredId } from './helpers';

type ExerciseSeedContext = {
  muscleIdsBySlug: ReadonlyMap<string, string>;
  movementPatternIdsBySlug: ReadonlyMap<string, string>;
  equipmentIdsBySlug: ReadonlyMap<string, string>;
};

async function seedExercise(
  prisma: PrismaClient,
  exercise: ExerciseSeed,
  context: ExerciseSeedContext,
): Promise<void> {
  const movementPatternId = getRequiredId(
    context.movementPatternIdsBySlug,
    exercise.movementPatternSlug,
    `Movement pattern referenced by exercise "${exercise.slug}"`,
  );
  const muscleRelations = exercise.muscles.map((muscle) => ({
    muscleId: getRequiredId(
      context.muscleIdsBySlug,
      muscle.muscleSlug,
      `Muscle referenced by exercise "${exercise.slug}"`,
    ),
    role: muscle.role,
    involvementScore: muscle.involvementScore,
    notes: muscle.notes ?? null,
  }));
  const equipmentIds = exercise.equipmentSlugs.map((equipmentSlug) =>
    getRequiredId(
      context.equipmentIdsBySlug,
      equipmentSlug,
      `Equipment referenced by exercise "${exercise.slug}"`,
    ),
  );

  await prisma.$transaction(async (transaction) => {
    const savedExercise = await transaction.exercise.upsert({
      where: { slug: exercise.slug },
      update: {
        name: exercise.name,
        description: exercise.description,
        instructions: exercise.instructions,
        commonMistakes: exercise.commonMistakes ?? null,
        movementPatternId,
        forceType: exercise.forceType,
        kineticChain: exercise.kineticChain,
        isCompound: exercise.isCompound,
        laterality: exercise.laterality,
        contractionMode: exercise.contractionMode,
        bodyPosition: exercise.bodyPosition,
        skillLevel: exercise.skillLevel,
        imageAltText: exercise.imageAltText,
        isActive: true,
        archivedAt: null,
      },
      create: {
        id: randomUUID(),
        name: exercise.name,
        slug: exercise.slug,
        description: exercise.description,
        instructions: exercise.instructions,
        commonMistakes: exercise.commonMistakes ?? null,
        movementPatternId,
        forceType: exercise.forceType,
        kineticChain: exercise.kineticChain,
        isCompound: exercise.isCompound,
        laterality: exercise.laterality,
        contractionMode: exercise.contractionMode,
        bodyPosition: exercise.bodyPosition,
        skillLevel: exercise.skillLevel,
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: exercise.imageAltText,
        isActive: true,
        archivedAt: null,
      },
    });

    await transaction.exerciseMuscle.deleteMany({
      where: { exerciseId: savedExercise.id },
    });
    await transaction.exerciseMuscle.createMany({
      data: muscleRelations.map((relation) => ({
        exerciseId: savedExercise.id,
        ...relation,
      })),
    });

    await transaction.exerciseEquipment.deleteMany({
      where: { exerciseId: savedExercise.id },
    });
    await transaction.exerciseEquipment.createMany({
      data: equipmentIds.map((equipmentId) => ({
        exerciseId: savedExercise.id,
        equipmentId,
      })),
    });

    await transaction.exerciseCapabilityProfile.upsert({
      where: { exerciseId: savedExercise.id },
      update: {
        ...exercise.capabilities,
        editorialNotes: exercise.capabilities.editorialNotes ?? null,
      },
      create: {
        exerciseId: savedExercise.id,
        ...exercise.capabilities,
        editorialNotes: exercise.capabilities.editorialNotes ?? null,
      },
    });

    await transaction.exerciseDemandProfile.upsert({
      where: { exerciseId: savedExercise.id },
      update: {
        ...exercise.demands,
        editorialNotes: exercise.demands.editorialNotes ?? null,
      },
      create: {
        exerciseId: savedExercise.id,
        ...exercise.demands,
        editorialNotes: exercise.demands.editorialNotes ?? null,
      },
    });
  });
}

export async function seedExercises(
  prisma: PrismaClient,
  context: ExerciseSeedContext,
): Promise<void> {
  const exerciseCount = exerciseCategories.reduce(
    (count, category) => count + category.exercises.length,
    0,
  );

  console.log('Seeding exercises:');

  for (const category of exerciseCategories) {
    console.log(`  ${category.name}: ${category.exercises.length}`);

    for (const exercise of category.exercises) {
      await seedExercise(prisma, exercise, context);
    }
  }

  console.log(`Seeded ${exerciseCount} exercises successfully.`);
}
