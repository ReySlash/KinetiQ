jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutSessionConcurrencyError } from '../../application/errors/workout-session.application.errors';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { PrismaWorkoutSessionsAdapter } from './prisma-workout-sessions.adapter';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';

function createWorkout(): WorkoutSession {
  return WorkoutSession.start({ ownerId, timezone: 'Asia/Qatar' }).addExercise({
    exerciseId,
    exerciseName: 'Bench Press',
    isExerciseActive: true,
  });
}

describe('PrismaWorkoutSessionsAdapter', () => {
  const workoutSessionCreate = jest.fn<Promise<unknown>, [unknown]>();
  const workoutSessionUpdate = jest.fn();
  const workoutSessionUpdateMany = jest.fn();
  const workoutSessionFindFirst = jest.fn();
  const workoutSessionFindUnique = jest.fn();
  const workoutSessionFindMany = jest.fn();
  const exercisePerformanceFindMany = jest.fn<Promise<unknown>, [unknown]>();
  const exercisePerformanceDeleteMany = jest.fn();
  const exercisePerformanceCreateMany = jest.fn();
  const completedSetDeleteMany = jest.fn();
  const completedSetCreateMany = jest.fn();
  const exerciseFindFirst = jest.fn();
  const routineFindFirst = jest.fn<Promise<unknown>, [unknown]>();
  const transaction = jest.fn(
    async (work: (client: object) => Promise<unknown>) =>
      work({
        workoutSession: {
          create: workoutSessionCreate,
          update: workoutSessionUpdate,
          updateMany: workoutSessionUpdateMany,
        },
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
      }),
  );
  let adapter: PrismaWorkoutSessionsAdapter;

  beforeEach(async () => {
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
    jest.clearAllMocks();
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
