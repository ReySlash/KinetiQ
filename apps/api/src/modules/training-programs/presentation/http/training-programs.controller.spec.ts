import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedPrincipal } from '../../../shared/infrastructure/auth/principal';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/commands/create-training-programs.use-case';
import { UpdateTrainingProgramUseCase } from '../../application/use-cases/commands/update-training-program.use-case';
import { DeleteTrainingProgramUseCase } from '../../application/use-cases/commands/delete-training-program.use-case';
import {
  TrainingProgramPersistenceError,
  TrainingProgramUpdateConflictError,
  TrainingProgramQueryError,
  TrainingProgramListAuthenticationError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramSlugConflictError,
} from '../../application/errors/training-program.errors';
import {
  TrainingProgramScheduleValidationError,
  TrainingProgramValidationError,
} from '../../domain/errors/training-program.errors';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from '../../application/use-cases/queries/get-training-program.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { ListTrainingProgramsQueryDto } from './dto/list-training-programs-query.dto';
import { TrainingProgramsController } from './training-programs.controller';

describe('TrainingProgramsController', () => {
  const execute = jest.fn();
  const create = jest.fn();
  const get = jest.fn();
  const update = jest.fn();
  const remove = jest.fn();
  let controller: TrainingProgramsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingProgramsController],
      providers: [
        { provide: ListTrainingProgramsUseCase, useValue: { execute } },
        { provide: GetTrainingProgramUseCase, useValue: { execute: get } },
        {
          provide: UpdateTrainingProgramUseCase,
          useValue: { execute: update },
        },
        {
          provide: DeleteTrainingProgramUseCase,
          useValue: { execute: remove },
        },
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
    get.mockResolvedValue({});
    update.mockResolvedValue({ slug: 'strength-base-12345678' });
    remove.mockResolvedValue({ slug: 'strength-base-12345678' });
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

  it('delegates detail lookup with the authenticated owner when present', async () => {
    const principal: AuthenticatedPrincipal = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'USER',
      sessionId: '223e4567-e89b-12d3-a456-426614174000',
    };

    await controller.findOne('strength-base-12345678', principal);

    expect(get).toHaveBeenCalledWith({
      slug: 'strength-base-12345678',
      ownerId: principal.userId,
    });
  });

  it('allows anonymous detail lookup without an owner scope', async () => {
    await controller.findOne('global-program-12345678', null);

    expect(get).toHaveBeenCalledWith({
      slug: 'global-program-12345678',
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

  it('updates an owned program and rejects an empty patch body', async () => {
    const principal: AuthenticatedPrincipal = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'USER',
      sessionId: '223e4567-e89b-12d3-a456-426614174000',
    };
    const dto = Object.assign(new UpdateTrainingProgramDto(), {
      durationWeeks: 6,
    });

    await expect(
      controller.update('strength-base-12345678', principal, dto),
    ).resolves.toEqual({
      message: 'Training program updated successfully',
      slug: 'strength-base-12345678',
    });
    expect(update).toHaveBeenCalledWith({
      ownerId: principal.userId,
      slug: 'strength-base-12345678',
      name: undefined,
      description: undefined,
      durationWeeks: 6,
      schedule: undefined,
    });

    await expect(
      controller.update(
        'strength-base-12345678',
        principal,
        new UpdateTrainingProgramDto(),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('deletes an owned program using the authenticated principal', async () => {
    const principal: AuthenticatedPrincipal = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      role: 'USER',
      sessionId: '223e4567-e89b-12d3-a456-426614174000',
    };

    await expect(
      controller.delete('strength-base-12345678', principal),
    ).resolves.toEqual({
      message: 'Training program deleted successfully',
      slug: 'strength-base-12345678',
    });
    expect(remove).toHaveBeenCalledWith({
      ownerId: principal.userId,
      slug: 'strength-base-12345678',
    });
  });

  it.each([
    [new TrainingProgramValidationError('test error'), 400],
    [new TrainingProgramScheduleValidationError('invalid schedule'), 422],
    [new TrainingProgramSlugConflictError(), 409],
    [new TrainingProgramRoutineUnavailableError(), 422],
    [new TrainingProgramUpdateConflictError(), 409],
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
