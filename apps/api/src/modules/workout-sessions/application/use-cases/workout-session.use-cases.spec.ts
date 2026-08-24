import { WorkoutSessionNotFoundError } from '../errors/workout-session.application.errors';
import type { WorkoutSessionDetail } from '../models/workout-session-query.model';
import type { WorkoutSessionsCommandPort } from '../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../ports/workout-sessions-query.port';
import type { WorkoutSessionSourcesPort } from '../ports/workout-session-sources.port';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import { AddWorkoutExerciseUseCase } from './commands/add-workout-exercise.use-case';
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
    const update = jest.fn((updated: WorkoutSession) => {
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
    expect(addedExerciseId).toBe(exerciseId);
    expect(addedExerciseName).toBe('Bench Press');
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
