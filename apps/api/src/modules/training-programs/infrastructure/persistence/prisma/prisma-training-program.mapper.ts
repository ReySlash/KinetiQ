import { Prisma } from '../../../../../../generated/prisma/client';
import type { TrainingProgramListItem } from '../../../application/models/list-training-programs.model';

export const trainingProgramListSelect = {
  slug: true,
  name: true,
  description: true,
  visibility: true,
  durationWeeks: true,
  updatedAt: true,
} satisfies Prisma.TrainingProgramSelect;

type PrismaTrainingProgramListItem = Prisma.TrainingProgramGetPayload<{
  select: typeof trainingProgramListSelect;
}>;

export function toListItem(
  row: PrismaTrainingProgramListItem,
): TrainingProgramListItem {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    durationWeeks: row.durationWeeks,
    updatedAt: row.updatedAt,
  };
}
