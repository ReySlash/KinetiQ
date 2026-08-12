import { Prisma } from '../../../../../../generated/prisma/client';
import type { TrainingProgramDetail } from '../../../application/models/detail-training-program.model';
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

export const trainingProgramDetailSelect = {
  slug: true,
  name: true,
  description: true,
  visibility: true,
  durationWeeks: true,
  updatedAt: true,
  routines: {
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    select: {
      weekNumber: true,
      dayNumber: true,
      notes: true,
      routine: {
        select: {
          slug: true,
          name: true,
          visibility: true,
        },
      },
    },
  },
} satisfies Prisma.TrainingProgramSelect;

type PrismaTrainingProgramDetail = Prisma.TrainingProgramGetPayload<{
  select: typeof trainingProgramDetailSelect;
}>;

export function toDetail(
  row: PrismaTrainingProgramDetail,
): TrainingProgramDetail {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    durationWeeks: row.durationWeeks,
    updatedAt: row.updatedAt,
    schedule: row.routines.map((entry) => ({
      weekNumber: entry.weekNumber,
      dayNumber: entry.dayNumber,
      notes: entry.notes,
      routine: {
        slug: entry.routine.slug,
        name: entry.routine.name,
        visibility: entry.routine.visibility,
      },
    })),
  };
}
