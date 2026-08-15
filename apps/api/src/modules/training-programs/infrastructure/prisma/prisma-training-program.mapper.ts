import { Prisma } from '../../../../../generated/prisma/client';
import type { TrainingProgramDetail } from '../../application/models/detail-training-program.model';
import type { TrainingProgramListItem } from '../../application/models/list-training-programs.model';
import { TrainingProgram } from '../../domain/entities/training-program.entity';

export const trainingProgramListSelect = {
  slug: true,
  name: true,
  description: true,
  visibility: true,
  durationWeeks: true,
  updatedAt: true,
} satisfies Prisma.TrainingProgramSelect;

export const trainingProgramAggregateSelect = {
  id: true,
  ownerId: true,
  slug: true,
  name: true,
  description: true,
  visibility: true,
  durationWeeks: true,
  createdAt: true,
  updatedAt: true,
  routines: {
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    select: {
      id: true,
      weekNumber: true,
      dayNumber: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      routine: { select: { slug: true } },
    },
  },
} satisfies Prisma.TrainingProgramSelect;

type PrismaTrainingProgramAggregate = Prisma.TrainingProgramGetPayload<{
  select: typeof trainingProgramAggregateSelect;
}>;

export function toDomain(row: PrismaTrainingProgramAggregate): TrainingProgram {
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
    schedule: row.routines.map((entry) => ({
      id: entry.id,
      routineSlug: entry.routine.slug,
      weekNumber: entry.weekNumber,
      dayNumber: entry.dayNumber,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    })),
  });
}

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
