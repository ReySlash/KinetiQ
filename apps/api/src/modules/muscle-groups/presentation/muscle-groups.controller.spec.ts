import { Test, TestingModule } from '@nestjs/testing';
import { GetMuscleGroupUseCase } from '../application/use-cases/queries/get-muscle-group.use-case';
import { ListMuscleGroupsUseCase } from '../application/use-cases/queries/list-muscle-groups.use-case';
import { MuscleGroupsController } from './muscle-groups.controller';

describe('MuscleGroupsController', () => {
  let controller: MuscleGroupsController;
  const findAll = jest.fn();
  const findOne = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuscleGroupsController],
      providers: [
        { provide: ListMuscleGroupsUseCase, useValue: { execute: findAll } },
        { provide: GetMuscleGroupUseCase, useValue: { execute: findOne } },
      ],
    }).compile();

    controller = module.get<MuscleGroupsController>(MuscleGroupsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should delegate to the list use case', async () => {
    const muscleGroups = [
      {
        id: 'group-1',
        name: 'Upper body',
        slug: 'upper-body',
        description: 'Upper body muscle group',
        sortOrder: 1,
      },
    ];
    findAll.mockResolvedValue(muscleGroups);

    await expect(controller.findAll()).resolves.toEqual(muscleGroups);
    expect(findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne should delegate to the get use case with the slug parameter', async () => {
    const muscleGroup = {
      id: 'group-1',
      name: 'Upper body',
      slug: 'upper-body',
      description: 'Upper body muscle group',
      muscles: [],
    };
    findOne.mockResolvedValue(muscleGroup);

    await expect(controller.findOne('upper-body')).resolves.toEqual(
      muscleGroup,
    );
    expect(findOne).toHaveBeenCalledWith('upper-body');
  });
});
