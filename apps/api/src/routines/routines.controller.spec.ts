import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedPrincipal } from '../auth/principal';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';

describe('RoutinesController', () => {
  let controller: RoutinesController;
  const routinesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    duplicate: jest.fn(),
  };
  const principal: AuthenticatedPrincipal = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'USER',
    sessionId: '223e4567-e89b-12d3-a456-426614174000',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutinesController],
      providers: [{ provide: RoutinesService, useValue: routinesServiceMock }],
    }).compile();

    controller = module.get<RoutinesController>(RoutinesController);
    jest.clearAllMocks();
  });

  it('passes the authenticated principal to create', async () => {
    const dto = new CreateRoutineDto();
    routinesServiceMock.create.mockResolvedValue({ id: 'routine-id' });

    await expect(controller.create(principal, dto)).resolves.toEqual({
      id: 'routine-id',
    });
    expect(routinesServiceMock.create).toHaveBeenCalledWith(principal, dto);
  });

  it('passes principal and query to list', async () => {
    const query = new FindRoutinesQueryDto();
    routinesServiceMock.findAll.mockResolvedValue([]);

    await expect(controller.findAll(principal, query)).resolves.toEqual([]);
    expect(routinesServiceMock.findAll).toHaveBeenCalledWith(principal, query);
  });

  it('passes principal to every resource mutation', async () => {
    const id = '323e4567-e89b-12d3-a456-426614174000';
    const updateDto = new UpdateRoutineDto();
    routinesServiceMock.findOne.mockResolvedValue({ id });
    routinesServiceMock.update.mockResolvedValue({ id });
    routinesServiceMock.remove.mockResolvedValue({ id });
    routinesServiceMock.duplicate.mockResolvedValue({ id });

    await controller.findOne(principal, id);
    await controller.update(principal, id, updateDto);
    await controller.remove(principal, id);
    await controller.duplicate(principal, id);

    expect(routinesServiceMock.findOne).toHaveBeenCalledWith(principal, id);
    expect(routinesServiceMock.update).toHaveBeenCalledWith(
      principal,
      id,
      updateDto,
    );
    expect(routinesServiceMock.remove).toHaveBeenCalledWith(principal, id);
    expect(routinesServiceMock.duplicate).toHaveBeenCalledWith(principal, id);
  });
});
