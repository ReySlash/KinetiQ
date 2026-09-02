import { WorkoutSessionNotFoundError } from '../errors/workout-session.application.errors';
import type { WorkoutSessionDetail } from '../models/workout-session-query.model';
import type { WorkoutSessionsCommandPort } from '../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../ports/workout-sessions-query.port';
import type { WorkoutSessionSourcesPort } from '../ports/workout-session-sources.port';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import { AddWorkoutExerciseUseCase } from './commands/add-workout-exercise.use-case';
import { CancelWorkoutUseCase } from './commands/cancel-workout.use-case';
import { CompleteWorkoutUseCase } from './commands/complete-workout.use-case';
import { StartWorkoutUseCase } from './commands/start-workout.use-case';
import { GetWorkoutUseCase } from './queries/get-workout.use-case';

const ownerId = '123e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';
const workoutId = '523e4567-e89b-12d3-a456-426614174000';

function queryPort(
  overrides: Partial<WorkoutSessionsQueryPort> = {},
): WorkoutSessionsQueryPort {
  return {
    findOwnedById: jest.fn(),
    findActiveByOwner: jest.fn(),
    getActiveDetail: jest.fn(),
    listHistory: jest.fn(),
    findExerciseHistory: jest.fn(),
    getDetail: jest.fn(),
    ...overrides,
  };
}

function commandPort(
  overrides: Partial<WorkoutSessionsCommandPort> = {},
): WorkoutSessionsCommandPort {
  return {
    create: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    ...overrides,
  };
}

function sourcePort(
  overrides: Partial<WorkoutSessionSourcesPort> = {},
): WorkoutSessionSourcesPort {
  return {
    findRoutineSnapshot: jest.fn(),
    findActiveExercise: jest.fn(),
    ...overrides,
  };
}

describe('Workout session application use cases', () => {
  it('starts a freestyle workout and persists the aggregate', async () => {
    let persisted: WorkoutSession | null = null;
    const create = jest.fn((workout: WorkoutSession) => {
      persisted = workout;
      return Promise.resolve();
    });
    const commands = commandPort({ create });
    const queries = queryPort({
      findActiveByOwner: jest.fn().mockResolvedValue(null),
    });
    const sources = sourcePort();
    const useCase = new StartWorkoutUseCase(commands, queries, sources);

    const result = await useCase.execute({
      ownerId,
      timezone: 'Asia/Qatar',
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(create).toHaveBeenCalledTimes(1);
    expect(persisted).toBeInstanceOf(WorkoutSession);
    expect(persisted?.ownerId).toBe(ownerId);
  });

  it('resolves an active exercise before adding it to the owned aggregate', async () => {
    const workout = WorkoutSession.start({ ownerId, timezone: 'Asia/Qatar' });
    let addedExerciseId: string | null = null;
    let addedExerciseName: string | null = null;
    let expectedVersion: number | null = null;
    const update = jest.fn((updated: WorkoutSession, version: number) => {
      expectedVersion = version;
      for (const performance of updated.exercisePerformances) {
        addedExerciseId = performance.exerciseId;
        addedExerciseName = performance.exerciseNameSnapshot;
      }
      return Promise.resolve();
    });
    const queries = queryPort({
      findOwnedById: jest.fn().mockResolvedValue(workout.toValue()),
    });
    const sources = sourcePort({
      findActiveExercise: jest
        .fn()
        .mockResolvedValue({ id: exerciseId, name: 'Bench Press' }),
    });
    const useCase = new AddWorkoutExerciseUseCase(
      commandPort({ update }),
      queries,
      sources,
    );

    const result = await useCase.execute({
      ownerId,
      workoutSessionId: workout.id.value,
      exerciseId,
    });

    expect(result.id).toBe(workout.id.value);
    expect(update).toHaveBeenCalledTimes(1);
    expect(expectedVersion).toBe(0);
    expect(addedExerciseId).toBe(exerciseId);
    expect(addedExerciseName).toBe('Bench Press');
  });

  it('delegates workout completion to the explicit atomic command', async () => {
    const workout = WorkoutSession.start({
      ownerId,
      timezone: 'Asia/Qatar',
    }).addExercise({
      exerciseId,
      exerciseName: 'Bench Press',
      isExerciseActive: true,
    });
    const performanceId = workout.exercisePerformances[0].id.value;
    const withSet = workout.recordSet(performanceId, {
      repetitions: 8,
      load: '100',
      loadUnit: 'KG',
    });
    const complete = jest.fn().mockResolvedValue(undefined);
    const update = jest.fn();
    const cancel = jest.fn();
    const useCase = new CompleteWorkoutUseCase(
      commandPort({ complete, update, cancel }),
      queryPort({
        findOwnedById: jest.fn().mockResolvedValue(withSet.toValue()),
      }),
    );

    const result = await useCase.execute({
      ownerId,
      workoutSessionId: withSet.id.value,
      completedAt: new Date(withSet.startedAt.getTime() + 1_000),
    });

    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED' }),
      withSet.version,
    );
    expect(update).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        id: withSet.id.value,
        status: 'COMPLETED',
        version: withSet.version + 1,
      }),
    );
  });

  it('delegates workout cancellation to the explicit atomic command', async () => {
    const workout = WorkoutSession.start({ ownerId, timezone: 'Asia/Qatar' });
    const cancel = jest.fn().mockResolvedValue(undefined);
    const update = jest.fn();
    const complete = jest.fn();
    const useCase = new CancelWorkoutUseCase(
      commandPort({ cancel, update, complete }),
      queryPort({
        findOwnedById: jest.fn().mockResolvedValue(workout.toValue()),
      }),
    );

    const result = await useCase.execute({
      ownerId,
      workoutSessionId: workout.id.value,
      cancelledAt: new Date(workout.startedAt.getTime() + 1_000),
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CANCELLED' }),
      workout.version,
    );
    expect(update).not.toHaveBeenCalled();
    expect(complete).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        id: workout.id.value,
        status: 'CANCELLED',
        version: workout.version + 1,
      }),
    );
  });

  it('returns a not-found error for inaccessible workout details', async () => {
    const useCase = new GetWorkoutUseCase(
      queryPort({
        getDetail: jest.fn().mockResolvedValue(null),
      }),
    );

    await expect(
      useCase.execute({ ownerId, workoutSessionId: workoutId }),
    ).rejects.toBeInstanceOf(WorkoutSessionNotFoundError);
  });

  it('returns query projections without changing them', async () => {
    const detail = { id: workoutId } as WorkoutSessionDetail;
    const useCase = new GetWorkoutUseCase(
      queryPort({
        getDetail: jest.fn().mockResolvedValue(detail),
      }),
    );

    await expect(
      useCase.execute({ ownerId, workoutSessionId: workoutId }),
    ).resolves.toBe(detail);
  });
});
