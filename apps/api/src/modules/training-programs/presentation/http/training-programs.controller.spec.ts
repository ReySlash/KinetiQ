import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedPrincipal } from '../../../../auth/principal';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/create-training-programs.use-case';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/list-training-programs.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
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
    create.mockResolvedValue({});
  });

  it('delegates to the list use case', async () => {
    await expect(controller.findAll()).resolves.toEqual([]);
    expect(execute).toHaveBeenCalledWith();
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
    });

    await controller.create(principal, dto);

    expect(create).toHaveBeenCalledWith({
      ownerId: principal.userId,
      name: 'Strength Base',
      slug: 'strength-base',
      description: null,
      durationWeeks: 4,
    });
  });
});
