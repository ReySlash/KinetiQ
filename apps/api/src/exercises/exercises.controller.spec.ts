jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  const exercisesServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: exercisesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to the service', async () => {
    const exercises = [
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
      },
    ];
    exercisesServiceMock.findAll.mockResolvedValue(exercises);

    await expect(
      controller.findAll({
        limit: 10,
        offset: 20,
        search: 'press',
        forceType: 'PUSH',
        laterality: 'BILATERAL',
        skillLevel: 'INTERMEDIATE',
      }),
    ).resolves.toEqual(exercises);
    expect(exercisesServiceMock.findAll).toHaveBeenCalledWith({
      limit: 10,
      offset: 20,
      search: 'press',
      forceType: 'PUSH',
      laterality: 'BILATERAL',
      skillLevel: 'INTERMEDIATE',
    });
  });

  it('findOne should delegate to the service with the slug parameter', async () => {
    const exercise = {
      id: 'exercise-1',
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
    };
    exercisesServiceMock.findOne.mockResolvedValue(exercise);

    await expect(controller.findOne('barbell-back-squat')).resolves.toEqual(
      exercise,
    );
    expect(exercisesServiceMock.findOne).toHaveBeenCalledWith(
      'barbell-back-squat',
    );
  });
});
