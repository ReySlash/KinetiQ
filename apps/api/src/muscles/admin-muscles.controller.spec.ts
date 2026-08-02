import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { AdminMusclesController } from './admin-muscles.controller';
import { MusclesService } from './muscles.service';

describe('AdminMusclesController', () => {
  let controller: AdminMusclesController;
  const musclesServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminMusclesController],
      providers: [
        {
          provide: MusclesService,
          useValue: musclesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdminMusclesController>(AdminMusclesController);
    jest.clearAllMocks();
  });

  it('requires the ADMIN platform role', () => {
    expect(Reflect.getMetadata('testRoles', AdminMusclesController)).toEqual([
      'ADMIN',
    ]);
  });

  it('delegates create to the service', async () => {
    const dto = new CreateMuscleDto();
    musclesServiceMock.create.mockResolvedValue({ id: 'muscle-id' });

    await expect(controller.create(dto)).resolves.toEqual({ id: 'muscle-id' });
    expect(musclesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = new UpdateMuscleDto();
    musclesServiceMock.update.mockResolvedValue({ id: 'muscle-id' });

    await expect(controller.update('biceps', dto)).resolves.toEqual({
      id: 'muscle-id',
    });
    expect(musclesServiceMock.update).toHaveBeenCalledWith('biceps', dto);
  });

  it('delegates remove to the service', async () => {
    musclesServiceMock.remove.mockResolvedValue({ id: 'muscle-id' });

    await expect(controller.remove('muscle-id')).resolves.toEqual({
      id: 'muscle-id',
    });
    expect(musclesServiceMock.remove).toHaveBeenCalledWith('muscle-id');
  });
});
