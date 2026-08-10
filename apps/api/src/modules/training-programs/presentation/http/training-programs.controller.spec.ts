import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedPrincipal } from '../../../../auth/principal';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/create-training-programs.use-case';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramListAuthenticationError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramSlugConflictError,
} from '../../application/errors/training-program.errors';
import {
  TrainingProgramScheduleValidationError,
  TrainingProgramValidationError,
} from '../../domain/errors/training-program.errors';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/list-training-programs.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { ListTrainingProgramsQueryDto } from './dto/list-training-programs-query.dto';
import { TrainingProgramsController } from './training-programs.controller';

describe('TrainingProgramsController', () => {
  const execute = jest.fn();
  const create = jest.fn();
  let controller: TrainingProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingProgramsController],
      providers: [
        { provide: ListTrainingProgramsUseCase, useValue: { execute } },
        {
          provide: CreateTrainingProgramUseCase,
          useValue: { execute: create },
        },
      ],
    }).compile();

    controller = module.get(TrainingProgramsController);
    jest.clearAllMocks();
    execute.mockResolvedValue([]);
    create.mockResolvedValue({ slug: 'strength-base-12345678' });
  });

  it('delegates to the list use case', async () => {
    const query = new ListTrainingProgramsQueryDto();
    await expect(controller.findAll(null, query)).resolves.toEqual([]);
    expect(execute).toHaveBeenCalledWith({ principal: null });
  });

  it('maps list persistence errors to a safe server error', async () => {
    execute.mockRejectedValue(new TrainingProgramQueryError());

    await expect(
      controller.findAll(null, new ListTrainingProgramsQueryDto()),
    ).rejects.toMatchObject({
      status: 500,
      message: 'Failed to fetch training programs.',
    });
  });

  it('derives the owner from the authenticated principal', async () => {
    const principal: AuthenticatedPrincipal = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'USER',
      sessionId: '223e4567-e89b-12d3-a456-426614174000',
    };
    const dto = Object.assign(new CreateTrainingProgramDto(), {
      name: 'Strength Base',
      slug: 'strength-base',
      description: null,
      durationWeeks: 4,
      schedule: [{ routineSlug: 'upper-a', weekNumber: 1, dayNumber: 1 }],
    });

    await expect(controller.create(principal, dto)).resolves.toEqual({
      message: 'Training program created successfully',
      slug: 'strength-base-12345678',
    });

    expect(create).toHaveBeenCalledWith({
      ownerId: principal.userId,
      name: 'Strength Base',
      slug: 'strength-base',
      description: null,
      durationWeeks: 4,
      schedule: dto.schedule,
    });
  });

  it.each([
    [new TrainingProgramValidationError('test error'), 400],
    [new TrainingProgramScheduleValidationError('invalid schedule'), 422],
    [new TrainingProgramSlugConflictError(), 409],
    [new TrainingProgramRoutineUnavailableError(), 422],
    [new TrainingProgramPersistenceError(), 500],
  ])('maps %p to HTTP status %s', async (error, status) => {
    create.mockRejectedValue(error);

    await expect(
      controller.create(
        {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          role: 'USER',
          sessionId: '223e4567-e89b-12d3-a456-426614174000',
        },
        Object.assign(new CreateTrainingProgramDto(), {
          name: 'Strength Base',
          durationWeeks: 4,
        }),
      ),
    ).rejects.toMatchObject({ status: status });
  });

  it('maps unauthenticated private listing to a meaningful 401', async () => {
    execute.mockRejectedValue(new TrainingProgramListAuthenticationError());

    await expect(
      controller.findAll(null, new ListTrainingProgramsQueryDto()),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Authentication is required to list your training programs.',
    });
  });
});
