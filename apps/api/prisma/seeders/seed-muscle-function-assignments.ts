import type { PrismaClient } from '../../generated/prisma/client';
import { muscleFunctionAssignments } from '../seed-data/muscle-function-assignments';
import { getRequiredId } from './helpers';

export async function seedMuscleFunctionAssignments(
  prisma: PrismaClient,
  muscleIdsBySlug: ReadonlyMap<string, string>,
  muscleFunctionIdsBySlug: ReadonlyMap<string, string>,
): Promise<void> {
  console.log(
    `Seeding ${muscleFunctionAssignments.length} muscle-function assignments...`,
  );

  const assignments = muscleFunctionAssignments.map((assignment) => ({
    muscleId: getRequiredId(muscleIdsBySlug, assignment.muscleSlug, 'Muscle'),
    functionId: getRequiredId(
      muscleFunctionIdsBySlug,
      assignment.muscleFunctionSlug,
      'Muscle function',
    ),
    role: assignment.role,
    contributionScore: assignment.contributionScore ?? null,
    notes: assignment.notes ?? null,
  }));

  await prisma.$transaction(async (transaction) => {
    await transaction.muscleFunctionAssignment.deleteMany({
      where: {
        muscleId: { in: [...muscleIdsBySlug.values()] },
        functionId: { in: [...muscleFunctionIdsBySlug.values()] },
      },
    });

    await transaction.muscleFunctionAssignment.createMany({
      data: assignments,
    });
  });
}
