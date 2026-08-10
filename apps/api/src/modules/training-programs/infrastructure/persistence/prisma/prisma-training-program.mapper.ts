import { Prisma } from '../../../../../../generated/prisma/client';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';

export const trainingProgramSelect = {
  id: true,
  ownerId: true,
  slug: true,
  name: true,
  description: true,
  visibility: true,
  durationWeeks: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TrainingProgramSelect;

type PrismaTrainingProgram = Prisma.TrainingProgramGetPayload<{
  select: typeof trainingProgramSelect;
}>;

export function toDomain(row: PrismaTrainingProgram): TrainingProgram {
  return TrainingProgram.reconstitute({
    id: row.id,
    ownerId: row.ownerId,
    slug: row.slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    durationWeeks: row.durationWeeks,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
