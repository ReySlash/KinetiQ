import { Test, TestingModule } from '@nestjs/testing';
jest.mock(
  '../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { MuscleGroupsController } from './muscle-groups.controller';
import { MuscleGroupsService } from './muscle-groups.service';

describe('MuscleGroupsController', () => {
  let controller: MuscleGroupsController;
  const muscleGroupsServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuscleGroupsController],
      providers: [
        {
          provide: MuscleGroupsService,
          useValue: muscleGroupsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<MuscleGroupsController>(MuscleGroupsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to the service', async () => {
    const muscleGroups = [
      {
        id: 'group-1',
        name: 'Upper body',
        slug: 'upper-body',
        description: 'Upper body muscle group',
        sortOrder: 1,
      },
    ];
    muscleGroupsServiceMock.findAll.mockResolvedValue(muscleGroups);

    await expect(controller.findAll()).resolves.toEqual(muscleGroups);
    expect(muscleGroupsServiceMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne should delegate to the service with the slug parameter', async () => {
    const muscleGroup = {
      id: 'group-1',
      name: 'Upper body',
      slug: 'upper-body',
      description: 'Upper body muscle group',
      muscles: [],
    };
    muscleGroupsServiceMock.findOne.mockResolvedValue(muscleGroup);

    await expect(controller.findOne('upper-body')).resolves.toEqual(
      muscleGroup,
    );
    expect(muscleGroupsServiceMock.findOne).toHaveBeenCalledWith('upper-body');
  });
});
