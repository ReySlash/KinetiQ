import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { AdminExercisesController } from './admin-exercises.controller';
import { ExercisesService } from './exercises.service';

describe('AdminExercisesController', () => {
  let controller: AdminExercisesController;
  const exercisesServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: exercisesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AdminExercisesController>(AdminExercisesController);
    jest.clearAllMocks();
  });

  it('requires the ADMIN platform role', () => {
    expect(Reflect.getMetadata('testRoles', AdminExercisesController)).toEqual([
      'ADMIN',
    ]);
  });

  it('delegates create to the service', async () => {
    const dto = new CreateExerciseDto();
    exercisesServiceMock.create.mockResolvedValue({ id: 'exercise-id' });

    await expect(controller.create(dto)).resolves.toEqual({
      id: 'exercise-id',
    });
    expect(exercisesServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('delegates update to the service', async () => {
    const dto = new UpdateExerciseDto();
    exercisesServiceMock.update.mockResolvedValue({ id: 'exercise-id' });

    await expect(controller.update('exercise-id', dto)).resolves.toEqual({
      id: 'exercise-id',
    });
    expect(exercisesServiceMock.update).toHaveBeenCalledWith(
      'exercise-id',
      dto,
    );
  });

  it('delegates archive to the service', async () => {
    exercisesServiceMock.archive.mockResolvedValue({ id: 'exercise-id' });

    await expect(controller.archive('exercise-id')).resolves.toEqual({
      id: 'exercise-id',
    });
    expect(exercisesServiceMock.archive).toHaveBeenCalledWith('exercise-id');
  });
});
