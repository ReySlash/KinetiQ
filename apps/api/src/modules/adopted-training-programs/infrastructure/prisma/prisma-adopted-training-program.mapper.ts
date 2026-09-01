import { Prisma } from '../../../../../generated/prisma/client';
import { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import type { PrimitiveAdoptedTrainingProgram } from '../../domain/adopted-training-program.types';
import type {
  AdoptedTrainingProgramDetail,
  ProgramWorkoutOccurrenceDetail,
} from '../../application/models/adopted-training-program-detail.model';
import type { AdoptedTrainingProgramSource } from '../../application/models/adopted-training-program-source.model';
import type {
  AdoptedTrainingProgramCommandResult,
  StartProgramWorkoutOccurrenceResult,
} from '../../application/models/adopted-training-program-command.input';
import { AdoptedTrainingProgramPersistenceStateError } from './prisma-adopted-training-program.errors';
import {
  isRoutineStartableForOwner,
  isRoutineVisibleForOwner,
} from './prisma-routine-startability';

export const adoptedTrainingProgramDetailSelect = {
  id: true,
  programNameSnapshot: true,
  status: true,
  durationWeeksSnapshot: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  occurrences: {
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    select: {
      id: true,
      weekNumber: true,
      dayNumber: true,
      routineNameSnapshot: true,
      programSlotNotesSnapshot: true,
      status: true,
      sourceRoutineId: true,
      sourceRoutine: {
        select: {
          id: true,
          ownerId: true,
          visibility: true,
          exercises: {
            where: { exercise: { isActive: false } },
            take: 1,
            select: { id: true },
          },
        },
      },
      sessionAttempts: {
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { id: true, status: true },
      },
    },
  },
} satisfies Prisma.AdoptedTrainingProgramSelect;

export type AdoptedTrainingProgramDetailRow =
  Prisma.AdoptedTrainingProgramGetPayload<{
    select: typeof adoptedTrainingProgramDetailSelect;
  }>;

export const adoptedTrainingProgramAggregateSelect = {
  id: true,
  ownerId: true,
  sourceTrainingProgramId: true,
  programNameSnapshot: true,
  durationWeeksSnapshot: true,
  status: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  occurrences: {
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    select: {
      id: true,
      adoptedTrainingProgramId: true,
      sourceTrainingProgramRoutineId: true,
      sourceRoutineId: true,
      weekNumber: true,
      dayNumber: true,
      routineNameSnapshot: true,
      programSlotNotesSnapshot: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.AdoptedTrainingProgramSelect;

export type AdoptedTrainingProgramAggregateRow =
  Prisma.AdoptedTrainingProgramGetPayload<{
    select: typeof adoptedTrainingProgramAggregateSelect;
  }>;

export function toDomain(
  row: AdoptedTrainingProgramAggregateRow,
): AdoptedTrainingProgram {
  const value: PrimitiveAdoptedTrainingProgram = {
    id: row.id,
    ownerId: row.ownerId,
    sourceTrainingProgramId: row.sourceTrainingProgramId,
    programNameSnapshot: row.programNameSnapshot,
    durationWeeksSnapshot: row.durationWeeksSnapshot,
    status: row.status,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    occurrences: row.occurrences,
  };
  return AdoptedTrainingProgram.reconstitute(value);
}

export const adoptedTrainingProgramSourceSelect = {
  id: true,
  name: true,
  durationWeeks: true,
  routines: {
    orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
    select: {
      id: true,
      weekNumber: true,
      dayNumber: true,
      notes: true,
      routine: {
        select: { id: true, name: true, ownerId: true, visibility: true },
      },
    },
  },
} satisfies Prisma.TrainingProgramSelect;

export type AdoptedTrainingProgramSourceRow = Prisma.TrainingProgramGetPayload<{
  select: typeof adoptedTrainingProgramSourceSelect;
}>;

export function toSource(
  row: AdoptedTrainingProgramSourceRow,
  ownerId: string,
): AdoptedTrainingProgramSource {
  return {
    id: row.id,
    name: row.name,
    durationWeeks: row.durationWeeks,
    schedule: row.routines.map((entry) => ({
      id: entry.id,
      routineId: isRoutineVisibleForOwner(entry.routine, ownerId)
        ? entry.routine.id
        : null,
      routineName: entry.routine.name,
      weekNumber: entry.weekNumber,
      dayNumber: entry.dayNumber,
      notes: entry.notes,
    })),
  };
}

export function toDetail(
  row: AdoptedTrainingProgramDetailRow,
  ownerId: string,
): AdoptedTrainingProgramDetail {
  if (row.occurrences.length === 0) {
    throw new AdoptedTrainingProgramPersistenceStateError();
  }
  const occurrences = row.occurrences.map((occurrence) =>
    toOccurrenceDetail(occurrence, ownerId),
  );
  const completedCount = occurrences.filter(
    (item) => item.status === 'COMPLETED',
  ).length;
  const skippedCount = occurrences.filter(
    (item) => item.status === 'SKIPPED',
  ).length;
  const resolvedCount = completedCount + skippedCount;
  const nextPendingOccurrence =
    occurrences.find((item) => item.status === 'PENDING') ?? null;
  const hasActiveOccurrence = occurrences.some(
    (item) => item.status === 'IN_PROGRESS',
  );

  return {
    id: row.id,
    programNameSnapshot: row.programNameSnapshot,
    status: row.status,
    durationWeeksSnapshot: row.durationWeeksSnapshot,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    totalCount: occurrences.length,
    completedCount,
    skippedCount,
    resolvedCount,
    progressPercent:
      Math.round((resolvedCount / occurrences.length) * 10000) / 100,
    occurrences,
    nextPendingOccurrence,
    actions: {
      canPause: row.status === 'ACTIVE' && !hasActiveOccurrence,
      canResume: row.status === 'PAUSED',
      canCancel:
        (row.status === 'ACTIVE' || row.status === 'PAUSED') &&
        !hasActiveOccurrence,
      canStartNext:
        row.status === 'ACTIVE' &&
        nextPendingOccurrence !== null &&
        nextPendingOccurrence.sourceRoutineAvailable,
      canSkipNext: row.status === 'ACTIVE' && nextPendingOccurrence !== null,
    },
  };
}

function toOccurrenceDetail(
  occurrence: AdoptedTrainingProgramDetailRow['occurrences'][number],
  ownerId: string,
): ProgramWorkoutOccurrenceDetail {
  const activeSession = occurrence.sessionAttempts.find(
    (session) => session.status === 'IN_PROGRESS',
  );
  return {
    id: occurrence.id,
    weekNumber: occurrence.weekNumber,
    dayNumber: occurrence.dayNumber,
    routineNameSnapshot: occurrence.routineNameSnapshot,
    programSlotNotesSnapshot: occurrence.programSlotNotesSnapshot,
    status: occurrence.status,
    sourceRoutineAvailable:
      occurrence.sourceRoutineId !== null &&
      isRoutineStartableForOwner(
        occurrence.sourceRoutine,
        ownerId,
        // The select only returns inactive exercises, so any result means the
        // source routine cannot be started with the current catalog.
        (occurrence.sourceRoutine?.exercises.length ?? 0) > 0,
      ),
    sessionAttemptIds: occurrence.sessionAttempts.map((session) => session.id),
    activeSessionId: activeSession?.id ?? null,
    latestSessionId: occurrence.sessionAttempts[0]?.id ?? null,
  };
}

export function toCommandResult(row: {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  updatedAt: Date;
}): AdoptedTrainingProgramCommandResult {
  return { id: row.id, status: row.status, updatedAt: row.updatedAt };
}

export function toStartResult(
  workoutSessionId: string,
  occurrenceId: string,
): StartProgramWorkoutOccurrenceResult {
  return {
    workoutSessionId,
    occurrenceId,
    sessionStatus: 'IN_PROGRESS',
    occurrenceStatus: 'IN_PROGRESS',
  };
}

export function toCreateData(
  program: AdoptedTrainingProgram,
): Prisma.AdoptedTrainingProgramCreateInput {
  const value = program.toValue();
  return {
    id: value.id,
    owner: { connect: { id: value.ownerId } },
    sourceTrainingProgram: value.sourceTrainingProgramId
      ? { connect: { id: value.sourceTrainingProgramId } }
      : undefined,
    programNameSnapshot: value.programNameSnapshot,
    durationWeeksSnapshot: value.durationWeeksSnapshot,
    status: value.status,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    cancelledAt: value.cancelledAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    occurrences: {
      create: value.occurrences.map((occurrence) => ({
        id: occurrence.id,
        sourceTrainingProgramRoutineId:
          occurrence.sourceTrainingProgramRoutineId,
        sourceRoutineId: occurrence.sourceRoutineId,
        weekNumber: occurrence.weekNumber,
        dayNumber: occurrence.dayNumber,
        routineNameSnapshot: occurrence.routineNameSnapshot,
        programSlotNotesSnapshot: occurrence.programSlotNotesSnapshot,
        status: occurrence.status,
        createdAt: occurrence.createdAt,
        updatedAt: occurrence.updatedAt,
      })),
    },
  };
}
