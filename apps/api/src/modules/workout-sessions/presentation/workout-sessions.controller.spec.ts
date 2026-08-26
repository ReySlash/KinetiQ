import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { AddWorkoutExerciseUseCase } from '../application/use-cases/commands/add-workout-exercise.use-case';
import { CancelWorkoutUseCase } from '../application/use-cases/commands/cancel-workout.use-case';
import { CompleteWorkoutUseCase } from '../application/use-cases/commands/complete-workout.use-case';
import { DeleteWorkoutSetUseCase } from '../application/use-cases/commands/delete-workout-set.use-case';
import { RecordWorkoutSetUseCase } from '../application/use-cases/commands/record-workout-set.use-case';
import { RemoveWorkoutExerciseUseCase } from '../application/use-cases/commands/remove-workout-exercise.use-case';
import { StartWorkoutUseCase } from '../application/use-cases/commands/start-workout.use-case';
import { UpdateWorkoutSetUseCase } from '../application/use-cases/commands/update-workout-set.use-case';
import { GetActiveWorkoutUseCase } from '../application/use-cases/queries/get-active-workout.use-case';
import { GetExerciseHistoryUseCase } from '../application/use-cases/queries/get-exercise-history.use-case';
import { GetWorkoutUseCase } from '../application/use-cases/queries/get-workout.use-case';
import { ListWorkoutHistoryUseCase } from '../application/use-cases/queries/list-workout-history.use-case';
import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { CancelWorkoutDto } from './dto/cancel-workout.dto';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { DeleteWorkoutSetDto } from './dto/delete-workout-set.dto';
import { GetExerciseHistoryQueryDto } from './dto/get-exercise-history-query.dto';
import { ListWorkoutHistoryQueryDto } from './dto/list-workout-history-query.dto';
import { RecordWorkoutSetDto } from './dto/record-workout-set.dto';
import { RemoveWorkoutExerciseDto } from './dto/remove-workout-exercise.dto';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { WorkoutSessionsController } from './workout-sessions.controller';

describe('WorkoutSessionsController', () => {
  let controller: WorkoutSessionsController;
  const useCases = {
    start: { execute: jest.fn() },
    addExercise: { execute: jest.fn() },
    removeExercise: { execute: jest.fn() },
    recordSet: { execute: jest.fn() },
    updateSet: { execute: jest.fn() },
    deleteSet: { execute: jest.fn() },
    complete: { execute: jest.fn() },
    cancel: { execute: jest.fn() },
    getActive: { execute: jest.fn() },
    getWorkout: { execute: jest.fn() },
    listHistory: { execute: jest.fn() },
    getExerciseHistory: { execute: jest.fn() },
  };
  const principal: AuthenticatedPrincipal = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'USER',
    sessionId: '223e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutSessionsController],
      providers: [
        { provide: StartWorkoutUseCase, useValue: useCases.start },
        { provide: AddWorkoutExerciseUseCase, useValue: useCases.addExercise },
        {
          provide: RemoveWorkoutExerciseUseCase,
          useValue: useCases.removeExercise,
        },
        { provide: RecordWorkoutSetUseCase, useValue: useCases.recordSet },
        { provide: UpdateWorkoutSetUseCase, useValue: useCases.updateSet },
        { provide: DeleteWorkoutSetUseCase, useValue: useCases.deleteSet },
        { provide: CompleteWorkoutUseCase, useValue: useCases.complete },
        { provide: CancelWorkoutUseCase, useValue: useCases.cancel },
        { provide: GetActiveWorkoutUseCase, useValue: useCases.getActive },
        { provide: GetWorkoutUseCase, useValue: useCases.getWorkout },
        { provide: ListWorkoutHistoryUseCase, useValue: useCases.listHistory },
        {
          provide: GetExerciseHistoryUseCase,
          useValue: useCases.getExerciseHistory,
        },
      ],
    }).compile();

    controller = module.get(WorkoutSessionsController);
    jest.clearAllMocks();
  });

  it('propagates the authenticated owner into start-workout commands', async () => {
    const dto = Object.assign(new StartWorkoutDto(), {
      timezone: 'Asia/Qatar',
      routineSlug: 'upper-a',
    });
    const result = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      status: 'IN_PROGRESS' as const,
      updatedAt: new Date(),
      version: 0,
    };
    useCases.start.execute.mockResolvedValue(result);

    await expect(controller.start(principal, dto)).resolves.toEqual(result);
    expect(useCases.start.execute).toHaveBeenCalledWith({
      ...dto,
      ownerId: principal.userId,
    });
  });

  it('propagates owner and route identifiers for child mutations', async () => {
    const sessionId = '323e4567-e89b-12d3-a456-426614174000';
    const performanceId = '423e4567-e89b-12d3-a456-426614174000';
    const setId = '523e4567-e89b-12d3-a456-426614174000';
    const result = {
      id: sessionId,
      status: 'IN_PROGRESS' as const,
      updatedAt: new Date(),
      version: 1,
    };
    Object.values(useCases).forEach((useCase) =>
      useCase.execute.mockResolvedValue(result),
    );

    await controller.addExercise(
      principal,
      sessionId,
      Object.assign(new AddWorkoutExerciseDto(), { exerciseId: setId }),
    );
    await controller.removeExercise(
      principal,
      sessionId,
      Object.assign(new RemoveWorkoutExerciseDto(), {
        exercisePerformanceId: performanceId,
      }),
    );
    await controller.recordSet(
      principal,
      sessionId,
      performanceId,
      Object.assign(new RecordWorkoutSetDto(), {
        repetitions: 10,
        load: '100',
        loadUnit: 'KG',
      }),
    );
    await controller.updateSet(
      principal,
      sessionId,
      performanceId,
      setId,
      Object.assign(new UpdateWorkoutSetDto(), { repetitions: 9 }),
    );
    await controller.deleteSet(
      principal,
      sessionId,
      performanceId,
      setId,
      new DeleteWorkoutSetDto(),
    );

    expect(useCases.addExercise.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      exerciseId: setId,
    });
    expect(useCases.removeExercise.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      exercisePerformanceId: performanceId,
    });
    expect(useCases.recordSet.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      exercisePerformanceId: performanceId,
      repetitions: 10,
      load: '100',
      loadUnit: 'KG',
    });
    expect(useCases.updateSet.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      exercisePerformanceId: performanceId,
      completedSetId: setId,
      repetitions: 9,
    });
    expect(useCases.deleteSet.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      exercisePerformanceId: performanceId,
      completedSetId: setId,
    });
  });

  it('routes lifecycle and owner-scoped history reads', async () => {
    const sessionId = '323e4567-e89b-12d3-a456-426614174000';
    const exerciseId = '423e4567-e89b-12d3-a456-426614174000';
    const completedAt = new Date('2026-08-25T10:00:00.000Z');
    const cancelledAt = new Date('2026-08-25T10:05:00.000Z');
    const history = Object.assign(new ListWorkoutHistoryQueryDto(), {
      q: 'upper body',
      limit: 20,
      offset: 0,
    });
    const exerciseHistory = Object.assign(new GetExerciseHistoryQueryDto(), {
      limit: 20,
      offset: 0,
    });
    Object.values(useCases).forEach((useCase) =>
      useCase.execute.mockResolvedValue([]),
    );

    await controller.complete(
      principal,
      sessionId,
      Object.assign(new CompleteWorkoutDto(), { completedAt }),
    );
    await controller.cancel(
      principal,
      sessionId,
      Object.assign(new CancelWorkoutDto(), { cancelledAt }),
    );
    await controller.getActive(principal);
    await controller.getOne(principal, sessionId);
    await controller.listHistory(principal, history);
    await controller.getExerciseHistory(principal, exerciseId, exerciseHistory);

    expect(useCases.complete.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      completedAt,
    });
    expect(useCases.cancel.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
      cancelledAt,
    });
    expect(useCases.getActive.execute).toHaveBeenCalledWith(principal.userId);
    expect(useCases.getWorkout.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      workoutSessionId: sessionId,
    });
    expect(useCases.listHistory.execute).toHaveBeenCalledWith({
      ...history,
      ownerId: principal.userId,
    });
    expect(useCases.getExerciseHistory.execute).toHaveBeenCalledWith({
      ...exerciseHistory,
      ownerId: principal.userId,
      exerciseId,
    });
  });
});
