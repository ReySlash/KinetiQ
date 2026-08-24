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
      if (row.exercises.some((exercise) => !exercise.exercise.isActive)) {
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

  private throwPersistenceError(error: unknown): never {
    if (
      error instanceof WorkoutSessionConcurrencyError ||
      error instanceof WorkoutSessionRoutineUnavailableError ||
      error instanceof WorkoutSessionExerciseUnavailableError ||
      error instanceof WorkoutSessionAlreadyActiveError
    ) {
      throw error;
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
