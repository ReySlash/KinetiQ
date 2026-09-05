import { randomUUID } from 'node:crypto';

import {
  TrainingProgramVisibility,
  type PrismaClient,
} from '../../generated/prisma/client';
import { globalTrainingPrograms } from '../seed-data/training-programs';

export async function seedGlobalTrainingPrograms(
  prisma: PrismaClient,
  ownerId: string,
): Promise<void> {
  const routineRows = await prisma.routine.findMany({
    where: {
      slug: {
        in: [
          ...new Set(
            globalTrainingPrograms.flatMap((program) =>
              program.schedule.map(({ routineKey }) => routineKey),
            ),
          ),
        ],
      },
    },
    select: { id: true, slug: true },
  });
  const routineIdsBySlug = new Map(
    routineRows.map((routine) => [routine.slug, routine.id]),
  );

  for (const program of globalTrainingPrograms) {
    await prisma.$transaction(async (transaction) => {
      const savedProgram = await transaction.trainingProgram.upsert({
        where: { slug: program.key },
        update: {
          ownerId,
          name: program.name,
          description: program.description,
          visibility: TrainingProgramVisibility.GLOBAL,
          durationWeeks: program.durationWeeks,
        },
        create: {
          id: randomUUID(),
          ownerId,
          slug: program.key,
          name: program.name,
          description: program.description,
          visibility: TrainingProgramVisibility.GLOBAL,
          durationWeeks: program.durationWeeks,
        },
        select: { id: true },
      });

      await transaction.trainingProgramRoutine.deleteMany({
        where: { trainingProgramId: savedProgram.id },
      });

      await transaction.trainingProgramRoutine.createMany({
        data: program.schedule.map((entry) => {
          const routineId = routineIdsBySlug.get(entry.routineKey);
          if (!routineId) {
            throw new Error(
              `Training program "${program.key}" references unknown global routine "${entry.routineKey}".`,
            );
          }

          return {
            id: randomUUID(),
            trainingProgramId: savedProgram.id,
            routineId,
            weekNumber: entry.weekNumber,
            dayNumber: entry.dayNumber,
            notes: entry.notes ?? null,
          };
        }),
      });
    });
  }
}
