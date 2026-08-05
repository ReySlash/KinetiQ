import { randomUUID } from 'node:crypto';
import {
  RoutineVisibility,
  type PrismaClient,
} from '../../generated/prisma/client';
import { globalRoutines } from '../seed-data/routines';

export async function seedGlobalRoutines(
  prisma: PrismaClient,
  ownerId: string,
): Promise<void> {
  for (const routine of globalRoutines) {
    await prisma.$transaction(async (transaction) => {
      const savedRoutine = await transaction.routine.upsert({
        where: { slug: routine.key },
        update: {
          ownerId,
          name: routine.name,
          description: routine.description,
          visibility: RoutineVisibility.GLOBAL,
        },
        create: {
          id: randomUUID(),
          ownerId,
          slug: routine.key,
          name: routine.name,
          description: routine.description,
          visibility: RoutineVisibility.GLOBAL,
        },
        select: { id: true },
      });

      await transaction.routineExercise.deleteMany({
        where: { routineId: savedRoutine.id },
      });
      await transaction.routineExercise.createMany({
        data: routine.exercises.map((exercise, order) => ({
          id: randomUUID(),
          routineId: savedRoutine.id,
          exerciseSlug: exercise.exerciseSlug,
          order,
          sets: exercise.sets,
          minReps: exercise.minReps,
          maxReps: exercise.maxReps,
          targetRir: exercise.targetRir ?? null,
          restSeconds: exercise.restSeconds ?? null,
          tempo: exercise.tempo ?? null,
          notes: exercise.notes ?? null,
        })),
      });
    });
  }
}
