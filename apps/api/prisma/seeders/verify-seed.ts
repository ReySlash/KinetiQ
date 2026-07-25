import { MuscleRole, type PrismaClient } from '../../generated/prisma/client';
import { exercises } from '../seed-data/exercises';

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

  const counts = await getSeedCounts(prisma);

  console.log('Verified database counts:', counts);

  return counts;
}
