import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import {
  WorkoutSessionAlreadyActiveError,
  WorkoutSessionConcurrencyError,
  WorkoutSessionExerciseUnavailableError,
  WorkoutSessionPersistenceError,
  WorkoutSessionQueryError,
  WorkoutSessionRoutineUnavailableError,
} from '../../application/errors/workout-session.application.errors';
import type { WorkoutSession } from '../../domain/entities/workout-session.entity';
import type { PrimitiveWorkoutSession } from '../../domain/entities/workout-session.types';
import type { AdoptedTrainingProgram } from '../../../adopted-training-programs/domain/adopted-training-program.aggregate';
import { hasExecutableRoutineExercises } from '../../../shared/domain/routine-startability';
import {
  adoptedTrainingProgramAggregateSelect,
  toDomain as toAdoptedTrainingProgramDomain,
} from '../../../adopted-training-programs/infrastructure/prisma/prisma-adopted-training-program.mapper';
import { WorkoutSessionsCommandPort } from '../../application/ports/workout-sessions-command.port';
import { WorkoutSessionSourcesPort } from '../../application/ports/workout-session-sources.port';
import { WorkoutSessionsQueryPort } from '../../application/ports/workout-sessions-query.port';
import type {
  GetExerciseHistoryQuery,
  GetWorkoutSessionQuery,
  WorkoutSessionListQuery,
} from '../../application/models/workout-session-query.model';
import {
  exerciseHistorySelect,
  toCreateData,
  toDetail,
  toDomain,
  toCompletedSetCreateManyData,
  toExercisePerformanceCreateManyData,
  toExerciseHistoryItem,
  toListItem,
  toNestedExercisePerformanceCreateData,
  toUpdateData,
  workoutSessionAggregateSelect,
  workoutSessionDetailSelect,
  workoutSessionListSelect,
} from './prisma-workout-sessions.mapper';

@Injectable()
export class PrismaWorkoutSessionsAdapter
  implements
    WorkoutSessionsCommandPort,
    WorkoutSessionsQueryPort,
    WorkoutSessionSourcesPort
{
  constructor(private readonly prisma: PrismaService) {}

  async create(workoutSession: WorkoutSession): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const value = workoutSession.toValue();
        await transaction.workoutSession.create({
          data: {
            ...toCreateData(workoutSession),
            performances: {
              create: value.exercisePerformances.map(
                toNestedExercisePerformanceCreateData,
              ),
            },
          },
        });
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async update(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const result = await transaction.workoutSession.updateMany({
          where: {
            id: workoutSession.id.value,
            ownerId: workoutSession.ownerId,
            version: expectedVersion,
          },
          data: toUpdateData(workoutSession),
        });

        if (result.count !== 1) {
          throw new WorkoutSessionConcurrencyError();
        }

        await transaction.completedSet.deleteMany({
          where: {
            exercisePerformance: { workoutSessionId: workoutSession.id.value },
          },
        });
        await transaction.exercisePerformance.deleteMany({
          where: { workoutSessionId: workoutSession.id.value },
        });

        const value = workoutSession.toValue();
        if (value.exercisePerformances.length > 0) {
          await transaction.exercisePerformance.createMany({
            data: value.exercisePerformances.map(
              toExercisePerformanceCreateManyData,
            ),
          });
        }

        const sets = value.exercisePerformances.flatMap((performance) =>
          performance.completedSets.map(toCompletedSetCreateManyData),
        );
        if (sets.length > 0) {
          await transaction.completedSet.createMany({ data: sets });
        }
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async complete(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void> {
    return this.persistLifecycle(workoutSession, expectedVersion, 'complete');
  }

  async cancel(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void> {
    return this.persistLifecycle(workoutSession, expectedVersion, 'cancel');
  }

  async findOwnedById(
    query: GetWorkoutSessionQuery,
  ): Promise<PrimitiveWorkoutSession | null> {
    try {
      const row = await this.prisma.workoutSession.findFirst({
        where: { id: query.workoutSessionId, ownerId: query.ownerId },
        select: workoutSessionAggregateSelect,
      });
      return row ? toDomain(row).toValue() : null;
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async findActiveByOwner(ownerId: string) {
    try {
      const row = await this.prisma.workoutSession.findFirst({
        where: { ownerId, status: 'IN_PROGRESS' },
        select: workoutSessionAggregateSelect,
      });
      return row ? toDomain(row).toValue() : null;
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async getActiveDetail(ownerId: string) {
    try {
      const row = await this.prisma.workoutSession.findFirst({
        where: { ownerId, status: 'IN_PROGRESS' },
        select: workoutSessionDetailSelect,
      });
      return row ? toDetail(row) : null;
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async getDetail(query: GetWorkoutSessionQuery) {
    try {
      const row = await this.prisma.workoutSession.findFirst({
        where: { id: query.workoutSessionId, ownerId: query.ownerId },
        select: workoutSessionDetailSelect,
      });
      return row ? toDetail(row) : null;
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async listHistory(query: WorkoutSessionListQuery) {
    try {
      const rows = await this.prisma.workoutSession.findMany({
        where: {
          ownerId: query.ownerId,
          ...(query.q
            ? {
                sourceRoutineNameSnapshot: {
                  contains: query.q,
                  mode: 'insensitive',
                },
              }
            : {}),
          ...(query.status ? { status: query.status } : {}),
          ...(query.from || query.to
            ? {
                startedAt: {
                  ...(query.from ? { gte: query.from } : {}),
                  ...(query.to ? { lte: query.to } : {}),
                },
              }
            : {}),
        },
        select: workoutSessionListSelect,
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        take: query.limit,
        skip: query.offset,
      });
      return rows.map(toListItem);
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async findExerciseHistory(query: GetExerciseHistoryQuery) {
    try {
      const rows = await this.prisma.exercisePerformance.findMany({
        where: {
          exerciseId: query.exerciseId,
          workoutSession: {
            ownerId: query.ownerId,
            ...(query.from || query.to
              ? {
                  startedAt: {
                    ...(query.from ? { gte: query.from } : {}),
                    ...(query.to ? { lte: query.to } : {}),
                  },
                }
              : {}),
          },
        },
        select: exerciseHistorySelect,
        orderBy: [{ workoutSession: { startedAt: 'desc' } }, { order: 'asc' }],
        take: query.limit,
        skip: query.offset,
      });
      return rows.map(toExerciseHistoryItem);
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async findRoutineSnapshot(slug: string, ownerId: string) {
    try {
      const owned = await this.prisma.routine.findFirst({
        where: { slug, ownerId, visibility: 'PRIVATE' },
        select: routineSnapshotSelect,
      });
      const row =
        owned ??
        (await this.prisma.routine.findFirst({
          where: { slug, visibility: 'GLOBAL' },
          select: routineSnapshotSelect,
        }));
      if (!row) return null;
      const exercises = row.exercises.map((exercise) => ({
        isActive: exercise.exercise.isActive,
        targetSetCount: exercise.sets,
        targetMinReps: exercise.minReps,
        targetMaxReps: exercise.maxReps,
        targetRir: exercise.targetRir,
        targetRestSeconds: exercise.restSeconds,
        targetTempo: exercise.tempo,
        prescriptionNotes: exercise.notes,
      }));
      if (!hasExecutableRoutineExercises(exercises)) {
        return null;
      }
      return {
        id: row.id,
        name: row.name,
        exercises: row.exercises.map((exercise) => ({
          exerciseId: exercise.exercise.id,
          sourceRoutineExerciseId: exercise.id,
          exerciseName: exercise.exercise.name,
          prescription: {
            targetSetCount: exercise.sets,
            targetMinReps: exercise.minReps,
            targetMaxReps: exercise.maxReps,
            targetRir: exercise.targetRir,
            targetRestSeconds: exercise.restSeconds,
            targetTempo: exercise.tempo,
            prescriptionNotes: exercise.notes,
          },
        })),
      };
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  async findActiveExercise(exerciseId: string) {
    try {
      return await this.prisma.exercise.findFirst({
        where: { id: exerciseId, isActive: true },
        select: { id: true, name: true },
      });
    } catch {
      throw new WorkoutSessionQueryError();
    }
  }

  private async persistLifecycle(
    workoutSession: WorkoutSession,
    expectedVersion: number,
    operation: 'complete' | 'cancel',
  ): Promise<void> {
    try {
      await this.prisma.$transaction(
        async (transaction) => {
          const persisted = await transaction.workoutSession.findFirst({
            where: {
              id: workoutSession.id.value,
              ownerId: workoutSession.ownerId,
              status: 'IN_PROGRESS',
              version: expectedVersion,
            },
            select: {
              programWorkoutOccurrenceId: true,
              programWorkoutOccurrence: {
                select: {
                  adoptedTrainingProgram: {
                    select: adoptedTrainingProgramAggregateSelect,
                  },
                },
              },
            },
          });
          if (!persisted) throw new WorkoutSessionConcurrencyError();

          const linkedTransition = this.transitionLinkedProgram(
            persisted.programWorkoutOccurrenceId,
            persisted.programWorkoutOccurrence?.adoptedTrainingProgram,
            workoutSession.ownerId,
            operation,
          );
          const session = await transaction.workoutSession.updateMany({
            where: {
              id: workoutSession.id.value,
              ownerId: workoutSession.ownerId,
              status: 'IN_PROGRESS',
              version: expectedVersion,
              programWorkoutOccurrenceId: persisted.programWorkoutOccurrenceId,
            },
            data: toUpdateData(workoutSession),
          });
          if (session.count !== 1) throw new WorkoutSessionConcurrencyError();

          if (!linkedTransition) return;
          const { before, after, occurrenceId } = linkedTransition;
          const occurrence = after.occurrences.find(
            (item) => item.id.value === occurrenceId,
          );
          if (!occurrence) throw new WorkoutSessionPersistenceError();

          const occurrenceUpdate =
            await transaction.programWorkoutOccurrence.updateMany({
              where: {
                id: occurrenceId,
                adoptedTrainingProgramId: before.id.value,
                status: 'IN_PROGRESS',
                adoptedTrainingProgram: {
                  ownerId: workoutSession.ownerId,
                  status: before.status,
                },
              },
              data: {
                status: occurrence.status,
                updatedAt: occurrence.updatedAt,
              },
            });
          if (occurrenceUpdate.count !== 1)
            throw new WorkoutSessionConcurrencyError();

          const programUpdate =
            await transaction.adoptedTrainingProgram.updateMany({
              where: {
                id: before.id.value,
                ownerId: workoutSession.ownerId,
                status: before.status,
                occurrences: {
                  some: { id: occurrenceId, status: occurrence.status },
                },
              },
              data: {
                status: after.status,
                completedAt: after.completedAt,
                cancelledAt: after.cancelledAt,
                updatedAt: after.updatedAt,
              },
            });
          if (programUpdate.count !== 1)
            throw new WorkoutSessionConcurrencyError();
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  private transitionLinkedProgram(
    occurrenceId: string | null,
    persistedProgram:
      | Prisma.AdoptedTrainingProgramGetPayload<{
          select: typeof adoptedTrainingProgramAggregateSelect;
        }>
      | null
      | undefined,
    ownerId: string,
    operation: 'complete' | 'cancel',
  ): {
    before: AdoptedTrainingProgram;
    after: AdoptedTrainingProgram;
    occurrenceId: string;
  } | null {
    if (!occurrenceId) return null;
    if (!persistedProgram || persistedProgram.ownerId !== ownerId) {
      throw new WorkoutSessionPersistenceError();
    }
    const before = toAdoptedTrainingProgramDomain(persistedProgram);
    const after =
      operation === 'complete'
        ? before.completeOccurrence(occurrenceId)
        : before.cancelOccurrence(occurrenceId);
    return { before, after, occurrenceId };
  }

  private throwPersistenceError(error: unknown): never {
    if (
      error instanceof WorkoutSessionConcurrencyError ||
      error instanceof WorkoutSessionPersistenceError ||
      error instanceof WorkoutSessionRoutineUnavailableError ||
      error instanceof WorkoutSessionExerciseUnavailableError ||
      error instanceof WorkoutSessionAlreadyActiveError
    ) {
      throw error;
    }
    if (isPrismaError(error, 'P2034')) {
      throw new WorkoutSessionConcurrencyError();
    }
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const fields = getPrismaConstraintFields(error);
        if (fields.length === 1 && fields[0] === 'ownerId') {
          throw new WorkoutSessionAlreadyActiveError();
        }
      }
      if (error.code === 'P2003') {
        const fields = getPrismaConstraintFields(error);
        if (fields.includes('exerciseId')) {
          throw new WorkoutSessionExerciseUnavailableError();
        }
      }
    }
    throw new WorkoutSessionPersistenceError();
  }
}

type PrismaError = { code: string };

function isPrismaError(error: unknown, code: string): error is PrismaError {
  return isRecord(error) && error.code === code;
}

function getPrismaConstraintFields(
  error: PrismaClientKnownRequestError,
): string[] {
  const meta = isRecord(error.meta) ? error.meta : undefined;
  const target = meta?.target;
  if (Array.isArray(target)) {
    return target.filter((field): field is string => typeof field === 'string');
  }
  if (typeof target === 'string') return [target];

  const driverAdapterError = isRecord(meta?.driverAdapterError)
    ? meta.driverAdapterError
    : undefined;
  const cause = isRecord(driverAdapterError?.cause)
    ? driverAdapterError.cause
    : undefined;
  const constraint = isRecord(cause?.constraint) ? cause.constraint : undefined;
  const fields = constraint?.fields;
  return Array.isArray(fields)
    ? fields.filter((field): field is string => typeof field === 'string')
    : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const routineSnapshotSelect = {
  id: true,
  name: true,
  exercises: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
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
