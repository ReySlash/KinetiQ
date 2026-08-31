import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import {
  AdoptedTrainingProgramAlreadyNonTerminalError,
  AdoptedTrainingProgramConcurrencyError,
  AdoptedTrainingProgramPersistenceError,
  AdoptedTrainingProgramQueryError,
  AdoptedTrainingProgramSourceUnavailableError,
} from '../../application/errors/adopted-training-program.errors';
import type {
  AdoptedTrainingProgramCommandResult,
  AdoptedTrainingProgramLifecycleInput,
  SkipProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceResult,
} from '../../application/models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramDetail } from '../../application/models/adopted-training-program-detail.model';
import { AdoptedTrainingProgramsCommandPort } from '../../application/ports/adopted-training-programs-command.port';
import { AdoptedTrainingProgramExecutionPort } from '../../application/ports/adopted-training-program-execution.port';
import { AdoptedTrainingProgramSourcesPort } from '../../application/ports/adopted-training-program-sources.port';
import { AdoptedTrainingProgramsQueryPort } from '../../application/ports/adopted-training-programs-query.port';
import type { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
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
import { isRoutineStartableForOwner } from './prisma-routine-startability';

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
    AdoptedTrainingProgramSourcesPort,
    AdoptedTrainingProgramExecutionPort
{
  constructor(private readonly prisma: PrismaService) {}

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

  async findAccessibleBySlug(slug: string, ownerId: string) {
    try {
      const row = await this.prisma.trainingProgram.findFirst({
        where: {
          slug,
          OR: [{ visibility: 'GLOBAL' }, { visibility: 'PRIVATE', ownerId }],
        },
        select: adoptedTrainingProgramSourceSelect,
      });
      return row ? toSource(row, ownerId) : null;
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
              occurrences: { none: { status: 'IN_PROGRESS' } },
            },
            data: { status: 'CANCELLED', cancelledAt: now, updatedAt: now },
          });
          if (result.count !== 1)
            throw new AdoptedTrainingProgramConcurrencyError();
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
          if (!next || next.id !== input.occurrenceId) {
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
            select: { id: true, sourceRoutineId: true },
          });
          if (!next || next.id !== input.occurrenceId) {
            throw new AdoptedTrainingProgramConcurrencyError();
          }
          if (!next.sourceRoutineId)
            throw new AdoptedTrainingProgramSourceUnavailableError();

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
          if (
            !routine ||
            !isRoutineStartableForOwner(
              routine,
              input.ownerId,
              routine.exercises.some((entry) => !entry.exercise.isActive),
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
                ? { occurrences: { none: { status: 'IN_PROGRESS' } } }
                : {}),
            },
            data: { status: to, updatedAt: now },
          });
          if (result.count !== 1)
            throw new AdoptedTrainingProgramConcurrencyError();
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

  private throwCommandError(error: unknown): never {
    if (error instanceof AdoptedTrainingProgramConcurrencyError) {
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
      const modelName = isRecord(error.meta) ? error.meta.modelName : undefined;
      if (modelName === 'WorkoutSession') {
        throw new AdoptedTrainingProgramConcurrencyError();
      }
      const details = getConstraintDetails(error);
      if (hasConstraint(details, 'one_in_progress_per')) {
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
