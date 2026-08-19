import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { CreateRoutineUseCase } from '../application/use-cases/commands/create-routine.use-case';
import { DeleteRoutineUseCase } from '../application/use-cases/commands/delete-routine.use-case';
import { DuplicateRoutineUseCase } from '../application/use-cases/commands/duplicate-routine.use-case';
import { UpdateRoutineUseCase } from '../application/use-cases/commands/update-routine.use-case';
import { GetRoutineUseCase } from '../application/use-cases/queries/get-routine.use-case';
import { ListRoutinesUseCase } from '../application/use-cases/queries/list-routines.use-case';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesController } from './routines.controller';

describe('RoutinesController', () => {
  let controller: RoutinesController;
  const list = { execute: jest.fn() };
  const get = { execute: jest.fn() };
  const create = { execute: jest.fn() };
  const update = { execute: jest.fn() };
  const remove = { execute: jest.fn() };
  const duplicate = { execute: jest.fn() };
  const principal: AuthenticatedPrincipal = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'USER',
    sessionId: '223e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutinesController],
      providers: [
        { provide: ListRoutinesUseCase, useValue: list },
        { provide: GetRoutineUseCase, useValue: get },
        { provide: CreateRoutineUseCase, useValue: create },
        { provide: UpdateRoutineUseCase, useValue: update },
        { provide: DeleteRoutineUseCase, useValue: remove },
        { provide: DuplicateRoutineUseCase, useValue: duplicate },
      ],
    }).compile();

    controller = module.get(RoutinesController);
    jest.clearAllMocks();
  });

  it('maps the authenticated principal into create input', async () => {
    const dto = Object.assign(new CreateRoutineDto(), {
      name: 'Upper Body',
      exercises: [],
    });
    create.execute.mockResolvedValue({ slug: 'upper-body-12345678' });

    await expect(controller.create(principal, dto)).resolves.toEqual({
      message: 'Routine created successfully',
      slug: 'upper-body-12345678',
    });
    expect(create.execute).toHaveBeenCalledWith({
      ...dto,
      ownerId: principal.userId,
    });
  });

  it('passes optional principal ownership to list and detail queries', async () => {
    const query = Object.assign(new FindRoutinesQueryDto(), {
      scope: 'global' as const,
    });
    list.execute.mockResolvedValue([]);
    get.execute.mockResolvedValue({ slug: 'upper-body' });

    await controller.findAll(null, query);
    await controller.findOne(null, 'upper-body');

    expect(list.execute).toHaveBeenCalledWith(query);
    expect(get.execute).toHaveBeenCalledWith({ slug: 'upper-body' });
  });

  it('routes update, delete, and duplicate commands through their use cases', async () => {
    const slug = 'upper-body-12345678';
    const dto = Object.assign(new UpdateRoutineDto(), { name: 'Lower Body' });
    update.execute.mockResolvedValue({ slug });
    remove.execute.mockResolvedValue({ slug });
    duplicate.execute.mockResolvedValue({ slug });

    await controller.update(principal, slug, dto);
    await controller.remove(principal, slug);
    await controller.duplicate(principal, slug);

    expect(update.execute).toHaveBeenCalledWith({
      ...dto,
      ownerId: principal.userId,
      slug,
    });
    expect(remove.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      slug,
    });
    expect(duplicate.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      slug,
    });
  });
});
