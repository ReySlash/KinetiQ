import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { CreateMuscleUseCase } from '../application/use-cases/commands/create-muscle.use-case';
import { DeactivateMuscleUseCase } from '../application/use-cases/commands/deactivate-muscle.use-case';
import { UpdateMuscleUseCase } from '../application/use-cases/commands/update-muscle.use-case';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { AdminMusclesController } from './admin-muscles.controller';

describe('AdminMusclesController', () => {
  let controller: AdminMusclesController;
  const createMuscleMock = { execute: jest.fn() };
  const updateMuscleMock = { execute: jest.fn() };
  const deactivateMuscleMock = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminMusclesController],
      providers: [
        { provide: CreateMuscleUseCase, useValue: createMuscleMock },
        { provide: UpdateMuscleUseCase, useValue: updateMuscleMock },
        { provide: DeactivateMuscleUseCase, useValue: deactivateMuscleMock },
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

  it('delegates create to the use case', async () => {
    const dto = new CreateMuscleDto();
    Object.assign(dto, {
      name: 'Biceps',
      description: 'A valid muscle description.',
      bodyRegion: 'UPPER_BODY',
    });

    await expect(controller.create(dto)).resolves.toEqual({
      message: 'Muscle created successfully',
    });
    expect(createMuscleMock.execute).toHaveBeenCalledWith({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      bodyRegion: dto.bodyRegion,
      muscleGroupId: dto.muscleGroupId,
      parentId: dto.parentId,
      thumbnailUrl: dto.thumbnailUrl,
      thumbnailStorageKey: dto.thumbnailStorageKey,
      imageAltText: dto.imageAltText,
      sortOrder: dto.sortOrder,
    });
  });

  it('delegates update to the use case', async () => {
    const dto = new UpdateMuscleDto();
    Object.assign(dto, { name: 'Biceps' });

    await expect(controller.update('biceps', dto)).resolves.toBe(
      'Muscle updated successfully',
    );
    expect(updateMuscleMock.execute).toHaveBeenCalledWith('biceps', {
      name: dto.name,
      description: dto.description,
      bodyRegion: dto.bodyRegion,
      muscleGroupId: dto.muscleGroupId,
      parentId: dto.parentId,
      thumbnailUrl: dto.thumbnailUrl,
      thumbnailStorageKey: dto.thumbnailStorageKey,
      imageAltText: dto.imageAltText,
      sortOrder: dto.sortOrder,
    });
  });

  it('delegates remove to the use case', async () => {
    await expect(controller.remove('muscle-id')).resolves.toBe(
      'Resource soft-deleted successfully',
    );

    expect(deactivateMuscleMock.execute).toHaveBeenCalledWith('muscle-id');
  });
});
