import {
  MuscleRole,
  RoutineVisibility,
  type PrismaClient,
} from '../../generated/prisma/client';
import { exercises } from '../seed-data/exercises';
import { globalRoutines } from '../seed-data/routines';
import { globalTrainingPrograms } from '../seed-data/training-programs';
import { SYSTEM_USER_ID } from '../seed-data/system-user';

export type SeedCounts = {
  muscleGroups: number;
  muscles: number;
  muscleFunctions: number;
  muscleFunctionAssignments: number;
  equipment: number;
  movementPatterns: number;
  exercises: number;
  exerciseMuscles: number;
  exerciseEquipment: number;
  capabilityProfiles: number;
  demandProfiles: number;
  globalRoutines: number;
  routineExercises: number;
  globalTrainingPrograms: number;
  trainingProgramRoutines: number;
};

export async function getSeedCounts(prisma: PrismaClient): Promise<SeedCounts> {
  const [
    muscleGroups,
    muscles,
    muscleFunctions,
    muscleFunctionAssignments,
    equipment,
    movementPatterns,
    exerciseCount,
    exerciseMuscles,
    exerciseEquipment,
    capabilityProfiles,
    demandProfiles,
    globalRoutineCount,
    routineExercises,
    globalTrainingProgramCount,
    trainingProgramRoutineCount,
  ] = await Promise.all([
    prisma.muscleGroup.count(),
    prisma.muscle.count(),
    prisma.muscleFunction.count(),
    prisma.muscleFunctionAssignment.count(),
    prisma.equipment.count(),
    prisma.movementPattern.count(),
    prisma.exercise.count(),
    prisma.exerciseMuscle.count(),
    prisma.exerciseEquipment.count(),
    prisma.exerciseCapabilityProfile.count(),
    prisma.exerciseDemandProfile.count(),
    prisma.routine.count({ where: { visibility: RoutineVisibility.GLOBAL } }),
    prisma.routineExercise.count(),
    prisma.trainingProgram.count({ where: { visibility: 'GLOBAL' } }),
    prisma.trainingProgramRoutine.count(),
  ]);

  return {
    muscleGroups,
    muscles,
    muscleFunctions,
    muscleFunctionAssignments,
    equipment,
    movementPatterns,
    exercises: exerciseCount,
    exerciseMuscles,
    exerciseEquipment,
    capabilityProfiles,
    demandProfiles,
    globalRoutines: globalRoutineCount,
    routineExercises,
    globalTrainingPrograms: globalTrainingProgramCount,
    trainingProgramRoutines: trainingProgramRoutineCount,
  };
}

export async function verifySeed(prisma: PrismaClient): Promise<SeedCounts> {
  const catalogSlugs = exercises.map(({ slug }) => slug);
  const [
    missingCapabilities,
    missingDemands,
    missingPrimaryMuscles,
    missingEquipment,
  ] = await Promise.all([
    prisma.exercise.count({
      where: {
        slug: { in: catalogSlugs },
        capabilities: { is: null },
      },
    }),
    prisma.exercise.count({
      where: {
        slug: { in: catalogSlugs },
        demands: { is: null },
      },
    }),
    prisma.exercise.count({
      where: {
        slug: { in: catalogSlugs },
        muscles: { none: { role: MuscleRole.PRIMARY } },
      },
    }),
    prisma.exercise.count({
      where: {
        slug: { in: catalogSlugs },
        equipment: { none: {} },
      },
    }),
  ]);

  const failures = [
    ['capability profile', missingCapabilities],
    ['demand profile', missingDemands],
    ['primary muscle relation', missingPrimaryMuscles],
    ['equipment relation', missingEquipment],
  ] as const;

  for (const [requirement, failureCount] of failures) {
    if (failureCount > 0) {
      throw new Error(
        `Seed verification failed: ${failureCount} catalog exercises are missing a ${requirement}.`,
      );
    }
  }

  const seededGlobalRoutines = await prisma.routine.findMany({
    where: { slug: { in: globalRoutines.map(({ key }) => key) } },
    select: {
      slug: true,
      ownerId: true,
      visibility: true,
      _count: { select: { exercises: true } },
    },
  });
  const seededBySlug = new Map(
    seededGlobalRoutines.map((routine) => [routine.slug, routine]),
  );

  for (const expected of globalRoutines) {
    const actual = seededBySlug.get(expected.key);
    if (
      !actual ||
      actual.ownerId !== SYSTEM_USER_ID ||
      actual.visibility !== RoutineVisibility.GLOBAL ||
      actual._count.exercises !== expected.exercises.length
    ) {
      throw new Error(
        `Seed verification failed for global routine "${expected.key}".`,
      );
    }
  }

  const seededGlobalTrainingPrograms = await prisma.trainingProgram.findMany({
    where: { slug: { in: globalTrainingPrograms.map(({ key }) => key) } },
    select: {
      slug: true,
      ownerId: true,
      visibility: true,
      durationWeeks: true,
      _count: { select: { routines: true } },
    },
  });
  const trainingProgramsBySlug = new Map(
    seededGlobalTrainingPrograms.map((program) => [program.slug, program]),
  );

  for (const expected of globalTrainingPrograms) {
    const actual = trainingProgramsBySlug.get(expected.key);
    if (
      !actual ||
      actual.ownerId !== SYSTEM_USER_ID ||
      actual.visibility !== 'GLOBAL' ||
      actual.durationWeeks !== expected.durationWeeks ||
      actual._count.routines !== expected.schedule.length
    ) {
      throw new Error(
        `Seed verification failed for global training program "${expected.key}".`,
      );
    }
  }

  const counts = await getSeedCounts(prisma);

  console.log('Verified database counts:', counts);

  return counts;
}
