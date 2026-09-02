jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, TestingModule } from '@nestjs/testing';
import {
  WorkoutSessionConcurrencyError,
  WorkoutSessionPersistenceError,
} from '../../application/errors/workout-session.application.errors';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { PrismaWorkoutSessionsAdapter } from './prisma-workout-sessions.adapter';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';
const programId = '623e4567-e89b-12d3-a456-426614174000';
const occurrenceId = '723e4567-e89b-12d3-a456-426614174000';
const nextOccurrenceId = '823e4567-e89b-12d3-a456-426614174000';

type UpdateManyArguments = {
  where: Record<string, unknown>;
  data: Record<string, unknown>;
};

function createWorkout(): WorkoutSession {
  return WorkoutSession.start({ ownerId, timezone: 'Asia/Qatar' }).addExercise({
    exerciseId,
    exerciseName: 'Bench Press',
    isExerciseActive: true,
  });
}

function createCompletableWorkout(): WorkoutSession {
  const workout = createWorkout();
  return workout.recordSet(workout.exercisePerformances[0].id.value, {
    repetitions: 8,
    load: '100',
    loadUnit: 'KG',
    completedAt: new Date(workout.startedAt.getTime() + 1_000),
  });
}

function linkedProgramRow(
  workout: WorkoutSession,
  options: { includePendingOccurrence?: boolean } = {},
) {
  return {
    programWorkoutOccurrenceId: occurrenceId,
    programWorkoutOccurrence: {
      adoptedTrainingProgram: {
        id: programId,
        ownerId,
        sourceTrainingProgramId: null,
        programNameSnapshot: 'Strength',
        durationWeeksSnapshot: 1,
        status: 'ACTIVE' as const,
        startedAt: workout.startedAt,
        completedAt: null,
        cancelledAt: null,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        occurrences: [
          {
            id: occurrenceId,
            adoptedTrainingProgramId: programId,
            sourceTrainingProgramRoutineId: null,
            sourceRoutineId: null,
            weekNumber: 1,
            dayNumber: 1,
            routineNameSnapshot: 'Upper A',
            programSlotNotesSnapshot: null,
            status: 'IN_PROGRESS' as const,
            createdAt: workout.createdAt,
            updatedAt: workout.updatedAt,
          },
          ...(options.includePendingOccurrence
            ? [
                {
                  id: nextOccurrenceId,
                  adoptedTrainingProgramId: programId,
                  sourceTrainingProgramRoutineId: null,
                  sourceRoutineId: null,
                  weekNumber: 1,
                  dayNumber: 2,
                  routineNameSnapshot: 'Lower A',
                  programSlotNotesSnapshot: null,
                  status: 'PENDING' as const,
                  createdAt: workout.createdAt,
                  updatedAt: workout.updatedAt,
                },
              ]
            : []),
        ],
      },
    },
  };
}

describe('PrismaWorkoutSessionsAdapter', () => {
  const workoutSessionCreate = jest.fn<Promise<unknown>, [unknown]>();
  const workoutSessionUpdate = jest.fn();
  const workoutSessionUpdateMany = jest.fn<
    Promise<{ count: number }>,
    [UpdateManyArguments]
  >();
  const workoutSessionFindFirst = jest.fn();
  const workoutSessionFindUnique = jest.fn();
  const workoutSessionFindMany = jest.fn();
  const transactionWorkoutSessionFindFirst = jest.fn();
  const occurrenceUpdateMany = jest.fn<
    Promise<{ count: number }>,
    [UpdateManyArguments]
  >();
  const adoptedProgramUpdateMany = jest.fn<
    Promise<{ count: number }>,
    [UpdateManyArguments]
  >();
  const exercisePerformanceFindMany = jest.fn<Promise<unknown>, [unknown]>();
  const exercisePerformanceDeleteMany = jest.fn();
  const exercisePerformanceCreateMany = jest.fn();
  const completedSetDeleteMany = jest.fn();
  const completedSetCreateMany = jest.fn();
  const exerciseFindFirst = jest.fn();
  const routineFindFirst = jest.fn<Promise<unknown>, [unknown]>();
  const transactionClient = {
    workoutSession: {
      create: workoutSessionCreate,
      findFirst: transactionWorkoutSessionFindFirst,
      update: workoutSessionUpdate,
      updateMany: workoutSessionUpdateMany,
    },
    programWorkoutOccurrence: { updateMany: occurrenceUpdateMany },
    adoptedTrainingProgram: { updateMany: adoptedProgramUpdateMany },
    exercisePerformance: {
      findMany: exercisePerformanceFindMany,
      deleteMany: exercisePerformanceDeleteMany,
      createMany: exercisePerformanceCreateMany,
    },
    completedSet: {
      deleteMany: completedSetDeleteMany,
      createMany: completedSetCreateMany,
    },
    exercise: { findFirst: exerciseFindFirst },
    routine: { findFirst: routineFindFirst },
  };
  const transaction = jest.fn<
    Promise<unknown>,
    [
      work: (client: typeof transactionClient) => Promise<unknown>,
      options?: unknown,
    ]
  >(async (work) => work(transactionClient));
  let adapter: PrismaWorkoutSessionsAdapter;

  beforeEach(async () => {
    jest.resetAllMocks();
    transaction.mockImplementation(async (work) => work(transactionClient));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaWorkoutSessionsAdapter,
        {
          provide: PrismaService,
          useValue: {
            workoutSession: {
              findFirst: workoutSessionFindFirst,
              findUnique: workoutSessionFindUnique,
              findMany: workoutSessionFindMany,
            },
            exercisePerformance: { findMany: exercisePerformanceFindMany },
            exercise: { findFirst: exerciseFindFirst },
            routine: { findFirst: routineFindFirst },
            $transaction: transaction,
          },
        },
      ],
    }).compile();

    adapter = module.get(PrismaWorkoutSessionsAdapter);
  });

  it('creates the complete aggregate inside one transaction', async () => {
    const workout = createWorkout();
    workoutSessionCreate.mockResolvedValue({});

    await expect(adapter.create(workout)).resolves.toBeUndefined();

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(workoutSessionCreate).toHaveBeenCalledTimes(1);
    expect(workoutSessionCreate.mock.calls[0]?.[0]).toHaveProperty(
      'data.id',
      workout.id.value,
    );
    expect(workoutSessionCreate.mock.calls[0]?.[0]).toHaveProperty(
      'data.ownerId',
      ownerId,
    );
    expect(workoutSessionCreate.mock.calls[0]?.[0]).toHaveProperty(
      'data.performances',
    );
  });

  it('updates only the owner-scoped aggregate version inside one transaction', async () => {
    const workout = createWorkout();
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });

    await expect(adapter.update(workout, 0)).resolves.toBeUndefined();

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(workoutSessionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: workout.id.value, ownerId, version: 0 },
      }),
    );
  });

  it('translates a stale optimistic-concurrency update into a stable error', async () => {
    const workout = createWorkout();
    workoutSessionUpdateMany.mockResolvedValue({ count: 0 });

    await expect(adapter.update(workout, 0)).rejects.toBeInstanceOf(
      WorkoutSessionConcurrencyError,
    );
  });

  it('atomically completes a linked occurrence and its resolved parent', async () => {
    const workout = createCompletableWorkout();
    const completed = workout.complete(
      new Date(workout.startedAt.getTime() + 2_000),
    );
    transactionWorkoutSessionFindFirst.mockResolvedValue(
      linkedProgramRow(workout),
    );
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });
    adoptedProgramUpdateMany.mockResolvedValue({ count: 1 });

    await expect(
      adapter.complete(completed, workout.version),
    ).resolves.toBeUndefined();

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[1]).toEqual({
      isolationLevel: 'Serializable',
    });
    expect(workoutSessionUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where',
      {
        id: workout.id.value,
        ownerId,
        status: 'IN_PROGRESS',
        version: workout.version,
        programWorkoutOccurrenceId: occurrenceId,
      },
    );
    expect(workoutSessionUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'COMPLETED',
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where.id',
      occurrenceId,
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where.adoptedTrainingProgramId',
      programId,
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where.status',
      'IN_PROGRESS',
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'COMPLETED',
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where.id',
      programId,
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'where.ownerId',
      ownerId,
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'COMPLETED',
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.completedAt',
      expect.any(Date),
    );
    expect(exercisePerformanceDeleteMany).not.toHaveBeenCalled();
    expect(completedSetDeleteMany).not.toHaveBeenCalled();
  });

  it('atomically cancels a linked attempt and returns its occurrence to pending', async () => {
    const workout = createWorkout();
    const cancelled = workout.cancel(
      new Date(workout.startedAt.getTime() + 1_000),
    );
    transactionWorkoutSessionFindFirst.mockResolvedValue(
      linkedProgramRow(workout),
    );
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });
    adoptedProgramUpdateMany.mockResolvedValue({ count: 1 });

    await expect(
      adapter.cancel(cancelled, workout.version),
    ).resolves.toBeUndefined();

    expect(workoutSessionUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'CANCELLED',
    );
    expect(occurrenceUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'PENDING',
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'ACTIVE',
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.completedAt',
      null,
    );
    expect(workoutSessionUpdateMany).toHaveBeenCalledTimes(1);
  });

  it('keeps the parent active when completing a non-final occurrence', async () => {
    const workout = createCompletableWorkout();
    const completed = workout.complete(
      new Date(workout.startedAt.getTime() + 2_000),
    );
    transactionWorkoutSessionFindFirst.mockResolvedValue(
      linkedProgramRow(workout, { includePendingOccurrence: true }),
    );
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceUpdateMany.mockResolvedValue({ count: 1 });
    adoptedProgramUpdateMany.mockResolvedValue({ count: 1 });

    await adapter.complete(completed, workout.version);

    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.status',
      'ACTIVE',
    );
    expect(adoptedProgramUpdateMany.mock.calls[0]?.[0]).toHaveProperty(
      'data.completedAt',
      null,
    );
  });

  it('completes a standalone workout without adopted-program writes', async () => {
    const workout = createCompletableWorkout();
    const completed = workout.complete(
      new Date(workout.startedAt.getTime() + 2_000),
    );
    transactionWorkoutSessionFindFirst.mockResolvedValue({
      programWorkoutOccurrenceId: null,
      programWorkoutOccurrence: null,
    });
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });

    await expect(
      adapter.complete(completed, workout.version),
    ).resolves.toBeUndefined();

    expect(workoutSessionUpdateMany).toHaveBeenCalledTimes(1);
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
    expect(adoptedProgramUpdateMany).not.toHaveBeenCalled();
  });

  it('rolls back linked completion when an occurrence conditional update loses', async () => {
    const workout = createCompletableWorkout();
    const completed = workout.complete(
      new Date(workout.startedAt.getTime() + 2_000),
    );
    transactionWorkoutSessionFindFirst.mockResolvedValue(
      linkedProgramRow(workout),
    );
    workoutSessionUpdateMany.mockResolvedValue({ count: 1 });
    occurrenceUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      adapter.complete(completed, workout.version),
    ).rejects.toBeInstanceOf(WorkoutSessionConcurrencyError);

    expect(adoptedProgramUpdateMany).not.toHaveBeenCalled();
  });

  it('rejects contradictory linked state through domain validation before writing', async () => {
    const workout = createCompletableWorkout();
    const completed = workout.complete(
      new Date(workout.startedAt.getTime() + 2_000),
    );
    const linked = linkedProgramRow(workout);
    transactionWorkoutSessionFindFirst.mockResolvedValue({
      ...linked,
      programWorkoutOccurrence: {
        adoptedTrainingProgram: {
          ...linked.programWorkoutOccurrence.adoptedTrainingProgram,
          occurrences:
            linked.programWorkoutOccurrence.adoptedTrainingProgram.occurrences.map(
              (occurrence) => ({ ...occurrence, status: 'PENDING' as const }),
            ),
        },
      },
    });

    await expect(
      adapter.complete(completed, workout.version),
    ).rejects.toBeInstanceOf(WorkoutSessionPersistenceError);

    expect(workoutSessionUpdateMany).not.toHaveBeenCalled();
    expect(occurrenceUpdateMany).not.toHaveBeenCalled();
  });

  it('resolves routine snapshots using the authenticated owner scope', async () => {
    routineFindFirst.mockResolvedValue({
      id: '523e4567-e89b-12d3-a456-426614174000',
      name: 'Upper A',
      exercises: [],
    });

    await adapter.findRoutineSnapshot('upper-a', ownerId);

    expect(routineFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'upper-a', ownerId, visibility: 'PRIVATE' },
      }),
    );
  });

  it('resolves only active exercises for add-exercise commands', async () => {
    exerciseFindFirst.mockResolvedValue({
      id: exerciseId,
      name: 'Bench Press',
    });

    await expect(adapter.findActiveExercise(exerciseId)).resolves.toEqual({
      id: exerciseId,
      name: 'Bench Press',
    });

    expect(exerciseFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: exerciseId, isActive: true },
      }),
    );
  });

  it('scopes aggregate reads by owner to prevent cross-user discovery', async () => {
    workoutSessionFindFirst.mockResolvedValue(null);

    await expect(
      adapter.findOwnedById({
        ownerId,
        workoutSessionId: '623e4567-e89b-12d3-a456-426614174000',
      }),
    ).resolves.toBeNull();

    expect(workoutSessionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '623e4567-e89b-12d3-a456-426614174000',
          ownerId,
        },
      }),
    );
  });

  it('queries the active workout using owner and IN_PROGRESS status', async () => {
    workoutSessionFindFirst.mockResolvedValue(null);

    await expect(adapter.findActiveByOwner(ownerId)).resolves.toBeNull();

    expect(workoutSessionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId, status: 'IN_PROGRESS' },
      }),
    );
  });

  it('uses owner-scoped, paginated history queries', async () => {
    workoutSessionFindMany.mockResolvedValue([]);

    await expect(
      adapter.listHistory({ ownerId, limit: 20, offset: 40 }),
    ).resolves.toEqual([]);

    expect(workoutSessionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId },
        take: 20,
        skip: 40,
      }),
    );
  });

  it('filters history by the case-insensitive routine name snapshot', async () => {
    workoutSessionFindMany.mockResolvedValue([]);

    await expect(
      adapter.listHistory({
        ownerId,
        q: 'upper body',
        limit: 20,
        offset: 0,
      }),
    ).resolves.toEqual([]);

    expect(workoutSessionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId,
          sourceRoutineNameSnapshot: {
            contains: 'upper body',
            mode: 'insensitive',
          },
        },
      }),
    );
  });

  it('uses owner-scoped exercise history queries', async () => {
    exercisePerformanceFindMany.mockResolvedValue([]);

    await expect(
      adapter.findExerciseHistory({
        ownerId,
        exerciseId,
        limit: 10,
        offset: 0,
      }),
    ).resolves.toEqual([]);

    expect(exercisePerformanceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          exerciseId,
          workoutSession: { ownerId },
        },
        take: 10,
        skip: 0,
      }),
    );
  });
});
