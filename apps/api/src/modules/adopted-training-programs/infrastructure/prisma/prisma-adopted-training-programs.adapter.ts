import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import {
  AdoptedTrainingProgramAlreadyNonTerminalError,
  AdoptedTrainingProgramConcurrencyError,
  AdoptedTrainingProgramEmptyScheduleError,
  AdoptedTrainingProgramNotFoundError,
  AdoptedTrainingProgramPersistenceError,
  AdoptedTrainingProgramQueryError,
  AdoptedTrainingProgramSourceIntegrityError,
  AdoptedTrainingProgramSourceNotFoundError,
  AdoptedTrainingProgramSourceUnavailableError,
} from '../../application/errors/adopted-training-program.errors';
import type {
  AdoptTrainingProgramInput,
  AdoptTrainingProgramResult,
  AdoptedTrainingProgramCommandResult,
  AdoptedTrainingProgramLifecycleInput,
  SkipProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../../application/models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramDetail } from '../../application/models/adopted-training-program-detail.model';
import type { AdoptedTrainingProgramSource } from '../../application/models/adopted-training-program-source.model';
import { AdoptedTrainingProgramsCommandPort } from '../../application/ports/adopted-training-programs-command.port';
import { AdoptedTrainingProgramExecutionPort } from '../../application/ports/adopted-training-program-execution.port';
import { AdoptedTrainingProgramsQueryPort } from '../../application/ports/adopted-training-programs-query.port';
import { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import { AdoptedTrainingProgramValidationError } from '../../domain/errors/adopted-training-program.errors';
import { WorkoutSession } from '../../../workout-sessions/domain/entities/workout-session.entity';
import { WorkoutSessionValidationError } from '../../../workout-sessions/domain/errors/workout-session.errors';
import type { SourceRoutineSnapshotAttributes } from '../../../workout-sessions/domain/entities/workout-session.types';
import {
  toCreateData as toWorkoutSessionCreateData,
  toNestedExercisePerformanceCreateData,
} from '../../../workout-sessions/infrastructure/prisma/prisma-workout-sessions.mapper';
import {
  adoptedTrainingProgramDetailSelect,
  adoptedTrainingProgramSourceSelect,
  toCommandResult,
  toCreateData,
  toDetail,
  toSource,
  toStartResult,
} from './prisma-adopted-training-program.mapper';
import {
  AdoptedTrainingProgramExerciseReferenceError,
  AdoptedTrainingProgramPersistenceStateError,
  AdoptedTrainingProgramOwnerReferenceError,
  AdoptedTrainingProgramScheduleConflictError,
  AdoptedTrainingProgramSourceProgramReferenceError,
  AdoptedTrainingProgramSourceRoutineReferenceError,
} from './prisma-adopted-training-program.errors';
import {
  hasInvalidRoutinePrescription,
  isRoutineStartableForOwner,
} from '../../../shared/domain/routine-startability';

const routineForStartSelect = {
  id: true,
  name: true,
  ownerId: true,
  visibility: true,
  exercises: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      order: true,
      sets: true,
      minReps: true,
      maxReps: true,
      targetRir: true,
      restSeconds: true,
      tempo: true,
      notes: true,
      exercise: { select: { id: true, name: true, isActive: true } },
    },
  },
} satisfies Prisma.RoutineSelect;

type RoutineForStartRow = Prisma.RoutineGetPayload<{
  select: typeof routineForStartSelect;
}>;

@Injectable()
export class PrismaAdoptedTrainingProgramsAdapter
  implements
    AdoptedTrainingProgramsCommandPort,
    AdoptedTrainingProgramsQueryPort,
    AdoptedTrainingProgramExecutionPort
{
  private readonly logger = new Logger(
    PrismaAdoptedTrainingProgramsAdapter.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async adopt(
    input: AdoptTrainingProgramInput,
  ): Promise<AdoptTrainingProgramResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const sourceRow = await transaction.trainingProgram.findFirst({
            where: {
              slug: input.sourceProgramSlug,
              OR: [
                { visibility: 'GLOBAL' },
                { visibility: 'PRIVATE', ownerId: input.ownerId },
              ],
            },
            select: adoptedTrainingProgramSourceSelect,
          });
          if (!sourceRow) {
            throw new AdoptedTrainingProgramSourceNotFoundError();
          }
          const source = toSource(sourceRow, input.ownerId);
          if (source.schedule.length === 0) {
            throw new AdoptedTrainingProgramEmptyScheduleError();
          }

          const program = AdoptedTrainingProgram.create({
            ownerId: input.ownerId,
            sourceTrainingProgramId: source.id,
            programNameSnapshot: source.name,
            durationWeeksSnapshot: source.durationWeeks,
            startedAt: new Date(),
            occurrences: toAdoptedProgramOccurrences(source),
          });
          await transaction.adoptedTrainingProgram.create({
            data: toCreateData(program),
          });
          return {
            id: program.id.value,
            status: 'ACTIVE',
            startedAt: program.startedAt,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwAdoptionError(error);
    }
  }

  async create(program: AdoptedTrainingProgram): Promise<void> {
    try {
      await this.prisma.adoptedTrainingProgram.create({
        data: toCreateData(program),
      });
    } catch (error) {
      this.throwCreateError(error);
    }
  }

  async findNonTerminalByOwner(
    ownerId: string,
  ): Promise<AdoptedTrainingProgramDetail | null> {
    try {
      const row = await this.prisma.adoptedTrainingProgram.findFirst({
        where: { ownerId, status: { in: ['ACTIVE', 'PAUSED'] } },
        select: adoptedTrainingProgramDetailSelect,
      });
      return row ? toDetail(row, ownerId) : null;
    } catch {
      throw new AdoptedTrainingProgramQueryError();
    }
  }

  async findOwnedDetailById(
    adoptedTrainingProgramId: string,
    ownerId: string,
  ): Promise<AdoptedTrainingProgramDetail | null> {
    try {
      const row = await this.prisma.adoptedTrainingProgram.findFirst({
        where: { id: adoptedTrainingProgramId, ownerId },
        select: adoptedTrainingProgramDetailSelect,
      });
      return row ? toDetail(row, ownerId) : null;
    } catch {
      throw new AdoptedTrainingProgramQueryError();
    }
  }

  async pause(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    return this.transitionProgram(input, 'ACTIVE', 'PAUSED');
  }

  async resume(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    return this.transitionProgram(input, 'PAUSED', 'ACTIVE');
  }

  async cancel(
    input: AdoptedTrainingProgramLifecycleInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const now = new Date();
          const result = await transaction.adoptedTrainingProgram.updateMany({
            where: {
              id: input.adoptedTrainingProgramId,
              ownerId: input.ownerId,
              status: { in: ['ACTIVE', 'PAUSED'] },
              occurrences: {
                none: {
                  OR: [
                    { status: 'IN_PROGRESS' },
                    { sessionAttempts: { some: { status: 'IN_PROGRESS' } } },
                  ],
                },
              },
            },
            data: { status: 'CANCELLED', cancelledAt: now, updatedAt: now },
          });
          if (result.count !== 1) {
            const program = await transaction.adoptedTrainingProgram.findFirst({
              where: {
                id: input.adoptedTrainingProgramId,
                ownerId: input.ownerId,
              },
              select: {
                id: true,
                occurrences: {
                  select: {
                    status: true,
                    sessionAttempts: { select: { status: true } },
                  },
                },
              },
            });
            if (!program) throw new AdoptedTrainingProgramNotFoundError();
            if (hasLifecycleStateMismatch(program.occurrences))
              throw new AdoptedTrainingProgramPersistenceStateError();
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          const row =
            await transaction.adoptedTrainingProgram.findUniqueOrThrow({
              where: { id: input.adoptedTrainingProgramId },
              select: { id: true, status: true, updatedAt: true },
            });
          return toCommandResult(row);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwCommandError(error);
    }
  }

  async skipOccurrence(
    input: SkipProgramWorkoutOccurrenceInput,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const next = await transaction.programWorkoutOccurrence.findFirst({
            where: {
              adoptedTrainingProgramId: input.adoptedTrainingProgramId,
              status: 'PENDING',
              adoptedTrainingProgram: {
                ownerId: input.ownerId,
                status: 'ACTIVE',
              },
            },
            orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
            select: { id: true },
          });
          if (!next) {
            const program = await transaction.adoptedTrainingProgram.findFirst({
              where: {
                id: input.adoptedTrainingProgramId,
                ownerId: input.ownerId,
              },
              select: { id: true },
            });
            if (!program) throw new AdoptedTrainingProgramNotFoundError();
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          if (next.id !== input.occurrenceId) {
            throw new AdoptedTrainingProgramConcurrencyError();
          }

          const now = new Date();
          const occurrence =
            await transaction.programWorkoutOccurrence.updateMany({
              where: {
                id: input.occurrenceId,
                adoptedTrainingProgram: {
                  ownerId: input.ownerId,
                  status: 'ACTIVE',
                },
                status: 'PENDING',
              },
              data: { status: 'SKIPPED', updatedAt: now },
            });
          if (occurrence.count !== 1)
            throw new AdoptedTrainingProgramConcurrencyError();
          return this.refreshProgramAfterOccurrenceChange(
            transaction,
            input.adoptedTrainingProgramId,
            now,
          );
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwCommandError(error);
    }
  }

  async startProgramWorkout(
    input: StartProgramWorkoutOccurrenceInput,
  ): Promise<StartProgramWorkoutOccurrenceResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const next = await transaction.programWorkoutOccurrence.findFirst({
            where: {
              adoptedTrainingProgramId: input.adoptedTrainingProgramId,
              status: 'PENDING',
              adoptedTrainingProgram: {
                id: input.adoptedTrainingProgramId,
                ownerId: input.ownerId,
                status: 'ACTIVE',
              },
            },
            orderBy: [{ weekNumber: 'asc' }, { dayNumber: 'asc' }],
            select: {
              id: true,
              sourceRoutineId: true,
              adoptedTrainingProgram: { select: { startedAt: true } },
            },
          });
          if (!next) {
            const program = await transaction.adoptedTrainingProgram.findFirst({
              where: {
                id: input.adoptedTrainingProgramId,
                ownerId: input.ownerId,
              },
              select: { id: true },
            });
            if (!program) throw new AdoptedTrainingProgramNotFoundError();
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          if (next.id !== input.occurrenceId) {
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          if (!next.sourceRoutineId)
            throw new AdoptedTrainingProgramSourceUnavailableError();
          if (input.startedAt) {
            const now = new Date();
            const futureLimit = new Date(now.getTime() + 5 * 60 * 1000);
            const backdateLimit = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000,
            );
            if (
              input.startedAt > futureLimit ||
              input.startedAt < backdateLimit ||
              input.startedAt < next.adoptedTrainingProgram.startedAt
            ) {
              throw new WorkoutSessionValidationError(
                'Workout start timestamp is outside the permitted range.',
              );
            }
          }

          const routine = await transaction.routine.findFirst({
            where: {
              id: next.sourceRoutineId,
              OR: [
                { visibility: 'GLOBAL' },
                { visibility: 'PRIVATE', ownerId: input.ownerId },
              ],
            },
            select: routineForStartSelect,
          });
          if (!routine) {
            throw new AdoptedTrainingProgramSourceUnavailableError();
          }
          const routineExercises = routine.exercises.map((entry) => ({
            isActive: entry.exercise.isActive,
            targetSetCount: entry.sets,
            targetMinReps: entry.minReps,
            targetMaxReps: entry.maxReps,
            targetRir: entry.targetRir,
            targetRestSeconds: entry.restSeconds,
            targetTempo: entry.tempo,
            prescriptionNotes: entry.notes,
          }));
          if (hasInvalidRoutinePrescription(routineExercises)) {
            this.logger.error('Invalid persisted routine prescription.', {
              ownerId: input.ownerId,
              adoptedTrainingProgramId: input.adoptedTrainingProgramId,
              occurrenceId: input.occurrenceId,
              routineId: routine.id,
            });
            throw new AdoptedTrainingProgramSourceIntegrityError();
          }
          if (
            !isRoutineStartableForOwner(
              routine,
              input.ownerId,
              routineExercises,
            )
          ) {
            throw new AdoptedTrainingProgramSourceUnavailableError();
          }

          const workoutSession = WorkoutSession.start({
            ownerId: input.ownerId,
            timezone: input.timezone,
            startedAt: input.startedAt,
            sourceRoutine: toSourceRoutineSnapshot(routine),
          });
          const now = workoutSession.createdAt;
          await transaction.workoutSession.create({
            data: {
              ...toWorkoutSessionCreateData(workoutSession),
              programWorkoutOccurrenceId: input.occurrenceId,
              performances: {
                create: workoutSession
                  .toValue()
                  .exercisePerformances.map(
                    toNestedExercisePerformanceCreateData,
                  ),
              },
            },
          });
          const occurrence =
            await transaction.programWorkoutOccurrence.updateMany({
              where: {
                id: input.occurrenceId,
                status: 'PENDING',
                adoptedTrainingProgram: {
                  ownerId: input.ownerId,
                  status: 'ACTIVE',
                },
              },
              data: { status: 'IN_PROGRESS', updatedAt: now },
            });
          if (occurrence.count !== 1)
            throw new AdoptedTrainingProgramConcurrencyError();
          return toStartResult(workoutSession.id.value, input.occurrenceId);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwExecutionError(error);
    }
  }

  private async transitionProgram(
    input: AdoptedTrainingProgramLifecycleInput,
    from: 'ACTIVE' | 'PAUSED',
    to: 'ACTIVE' | 'PAUSED',
  ): Promise<AdoptedTrainingProgramCommandResult> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const now = new Date();
          const result = await transaction.adoptedTrainingProgram.updateMany({
            where: {
              id: input.adoptedTrainingProgramId,
              ownerId: input.ownerId,
              status: from,
              ...(from === 'ACTIVE'
                ? {
                    occurrences: {
                      none: {
                        OR: [
                          { status: 'IN_PROGRESS' },
                          {
                            sessionAttempts: {
                              some: { status: 'IN_PROGRESS' },
                            },
                          },
                        ],
                      },
                    },
                  }
                : {}),
            },
            data: { status: to, updatedAt: now },
          });
          if (result.count !== 1) {
            const program = await transaction.adoptedTrainingProgram.findFirst({
              where: {
                id: input.adoptedTrainingProgramId,
                ownerId: input.ownerId,
              },
              select: {
                id: true,
                occurrences: {
                  select: {
                    status: true,
                    sessionAttempts: { select: { status: true } },
                  },
                },
              },
            });
            if (!program) throw new AdoptedTrainingProgramNotFoundError();
            if (hasLifecycleStateMismatch(program.occurrences))
              throw new AdoptedTrainingProgramPersistenceStateError();
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          const row =
            await transaction.adoptedTrainingProgram.findUniqueOrThrow({
              where: { id: input.adoptedTrainingProgramId },
              select: { id: true, status: true, updatedAt: true },
            });
          return toCommandResult(row);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwCommandError(error);
    }
  }

  private async refreshProgramAfterOccurrenceChange(
    transaction: Prisma.TransactionClient,
    programId: string,
    now: Date,
  ): Promise<AdoptedTrainingProgramCommandResult> {
    const unresolved = await transaction.programWorkoutOccurrence.count({
      where: {
        adoptedTrainingProgramId: programId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });
    await transaction.adoptedTrainingProgram.update({
      where: { id: programId },
      data:
        unresolved === 0
          ? { status: 'COMPLETED', completedAt: now, updatedAt: now }
          : { updatedAt: now },
    });
    const row = await transaction.adoptedTrainingProgram.findUniqueOrThrow({
      where: { id: programId },
      select: { id: true, status: true, updatedAt: true },
    });
    return toCommandResult(row);
  }

  private throwCreateError(error: unknown): never {
    if (error instanceof AdoptedTrainingProgramAlreadyNonTerminalError) {
      throw error;
    }
    if (isPrismaError(error, 'P2002')) {
      const details = getConstraintDetails(error);
      if (hasConstraint(details, 'one_non_terminal_per_owner')) {
        throw new AdoptedTrainingProgramAlreadyNonTerminalError();
      }
      if (details.fields.includes('ownerId')) {
        throw new AdoptedTrainingProgramAlreadyNonTerminalError();
      }
      if (
        details.fields.includes('weekNumber') ||
        details.fields.includes('dayNumber') ||
        hasConstraint(details, 'adopted_slot')
      ) {
        throw new AdoptedTrainingProgramScheduleConflictError();
      }
    }
    if (isPrismaError(error, 'P2003')) {
      const details = getConstraintDetails(error);
      if (hasField(details, 'ownerId')) {
        throw new AdoptedTrainingProgramOwnerReferenceError();
      }
      if (hasField(details, 'sourceTrainingProgramId')) {
        throw new AdoptedTrainingProgramSourceProgramReferenceError();
      }
      if (hasField(details, 'sourceRoutineId')) {
        throw new AdoptedTrainingProgramSourceRoutineReferenceError();
      }
      if (hasField(details, 'sourceTrainingProgramRoutineId')) {
        throw new AdoptedTrainingProgramSourceRoutineReferenceError();
      }
    }
    throw new AdoptedTrainingProgramPersistenceError();
  }

  private throwAdoptionError(error: unknown): never {
    if (
      error instanceof AdoptedTrainingProgramSourceNotFoundError ||
      error instanceof AdoptedTrainingProgramEmptyScheduleError ||
      error instanceof AdoptedTrainingProgramAlreadyNonTerminalError ||
      error instanceof AdoptedTrainingProgramValidationError
    ) {
      throw error;
    }
    if (isPrismaError(error, 'P2034')) {
      throw new AdoptedTrainingProgramConcurrencyError();
    }
    if (isPrismaError(error, 'P2002') || isPrismaError(error, 'P2003')) {
      this.throwCreateError(error);
    }
    if (error instanceof AdoptedTrainingProgramQueryError) {
      throw error;
    }
    throw new AdoptedTrainingProgramPersistenceError();
  }

  private throwCommandError(error: unknown): never {
    if (
      error instanceof AdoptedTrainingProgramConcurrencyError ||
      error instanceof AdoptedTrainingProgramNotFoundError ||
      error instanceof AdoptedTrainingProgramPersistenceStateError
    ) {
      throw error;
    }
    if (isPrismaError(error, 'P2034')) {
      throw new AdoptedTrainingProgramConcurrencyError();
    }
    if (isPrismaError(error, 'P2025')) {
      throw new AdoptedTrainingProgramPersistenceStateError();
    }
    throw new AdoptedTrainingProgramPersistenceError();
  }

  private throwExecutionError(error: unknown): never {
    if (
      error instanceof AdoptedTrainingProgramConcurrencyError ||
      error instanceof AdoptedTrainingProgramNotFoundError ||
      error instanceof AdoptedTrainingProgramSourceIntegrityError ||
      error instanceof AdoptedTrainingProgramSourceUnavailableError ||
      error instanceof AdoptedTrainingProgramExerciseReferenceError ||
      error instanceof WorkoutSessionValidationError
    ) {
      throw error;
    }
    if (isPrismaError(error, 'P2034')) {
      throw new AdoptedTrainingProgramConcurrencyError();
    }
    if (isPrismaError(error, 'P2002')) {
      const details = getConstraintDetails(error);
      if (
        hasConstraint(details, 'one_in_progress_per_owner') ||
        hasConstraint(details, 'one_in_progress_per_occurrence')
      ) {
        throw new AdoptedTrainingProgramConcurrencyError();
      }
    }
    if (isPrismaError(error, 'P2003')) {
      const details = getConstraintDetails(error);
      if (
        hasField(details, 'sourceRoutineId') ||
        hasField(details, 'sourceRoutineExerciseId')
      ) {
        throw new AdoptedTrainingProgramSourceUnavailableError();
      }
      if (hasField(details, 'exerciseId')) {
        throw new AdoptedTrainingProgramExerciseReferenceError();
      }
    }
    if (isPrismaError(error, 'P2025')) {
      throw new AdoptedTrainingProgramPersistenceStateError();
    }
    throw new AdoptedTrainingProgramPersistenceError();
  }
}

type PrismaErrorDetails = { constraint: string; fields: string[] };

type PrismaKnownError = {
  code: string;
  message?: string;
  meta?: unknown;
};

function isPrismaError(
  error: unknown,
  code: string,
): error is PrismaKnownError {
  return isRecord(error) && error.code === code;
}

function getConstraintDetails(error: PrismaKnownError): PrismaErrorDetails {
  const meta = error.meta;
  if (!meta || typeof meta !== 'object') return { constraint: '', fields: [] };
  const record = isRecord(meta) ? meta : {};
  const target = record.target;
  const namedTarget = typeof target === 'string' ? target : '';
  const fields = Array.isArray(target)
    ? target.filter((field): field is string => typeof field === 'string')
    : typeof target === 'string'
      ? [target]
      : [];
  const driverAdapterError = isRecord(record.driverAdapterError)
    ? record.driverAdapterError
    : undefined;
  const cause =
    driverAdapterError && isRecord(driverAdapterError.cause)
      ? driverAdapterError.cause
      : undefined;
  const constraint =
    cause && isRecord(cause.constraint) ? cause.constraint : undefined;
  const namedConstraint =
    cause && typeof cause.constraint === 'string' ? cause.constraint : '';
  const constraintFields =
    constraint && Array.isArray(constraint.fields)
      ? constraint.fields.filter(
          (field): field is string => typeof field === 'string',
        )
      : [];
  const driverField =
    cause && typeof cause.column === 'string'
      ? cause.column
      : cause && typeof cause.field === 'string'
        ? cause.field
        : '';
  const messageConstraints = [
    typeof error.message === 'string' ? error.message : '',
    cause && typeof cause.originalMessage === 'string'
      ? cause.originalMessage
      : '',
  ].flatMap((message) => {
    const matches = message.matchAll(/constraint ["']([^"']+)["']/g);
    return [...matches].map((match) => match[1] ?? '');
  });
  return {
    constraint: [
      namedTarget,
      namedConstraint,
      constraintFields.join('_'),
      ...messageConstraints,
    ]
      .filter((value) => value.length > 0)
      .join('_'),
    fields: [...new Set([...fields, ...constraintFields, driverField])],
  };
}

function hasField(details: PrismaErrorDetails, field: string): boolean {
  return details.fields.includes(field) || details.constraint.includes(field);
}

function hasConstraint(
  details: PrismaErrorDetails,
  constraint: string,
): boolean {
  return (
    details.constraint.includes(constraint) ||
    details.fields.includes(constraint)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasLifecycleStateMismatch(
  occurrences:
    | ReadonlyArray<{
        status: string;
        sessionAttempts: ReadonlyArray<{ status: string }>;
      }>
    | undefined,
): boolean {
  return (
    occurrences?.some((occurrence) => {
      const hasActiveOccurrence = occurrence.status === 'IN_PROGRESS';
      const hasActiveSession = occurrence.sessionAttempts.some(
        (session) => session.status === 'IN_PROGRESS',
      );
      return hasActiveOccurrence !== hasActiveSession;
    }) ?? false
  );
}

function toAdoptedProgramOccurrences(source: AdoptedTrainingProgramSource) {
  return source.schedule.map((scheduleItem) => ({
    sourceTrainingProgramRoutineId: scheduleItem.id,
    sourceRoutineId: scheduleItem.routineId,
    weekNumber: scheduleItem.weekNumber,
    dayNumber: scheduleItem.dayNumber,
    routineNameSnapshot: scheduleItem.routineName,
    programSlotNotesSnapshot: scheduleItem.notes,
  }));
}

function toSourceRoutineSnapshot(
  routine: RoutineForStartRow,
): SourceRoutineSnapshotAttributes {
  return {
    id: routine.id,
    name: routine.name,
    exercises: routine.exercises.map((entry) => ({
      exerciseId: entry.exercise.id,
      sourceRoutineExerciseId: entry.id,
      exerciseName: entry.exercise.name,
      prescription: {
        targetSetCount: entry.sets,
        targetMinReps: entry.minReps,
        targetMaxReps: entry.maxReps,
        targetRir: entry.targetRir,
        targetRestSeconds: entry.restSeconds,
        targetTempo: entry.tempo,
        prescriptionNotes: entry.notes,
      },
    })),
  };
}
