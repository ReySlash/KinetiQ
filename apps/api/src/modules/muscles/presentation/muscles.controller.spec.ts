import 'reflect-metadata';

import { Test, TestingModule } from '@nestjs/testing';
import { GetMuscleUseCase } from '../application/use-cases/queries/get-muscle.use-case';
import { ListMusclesUseCase } from '../application/use-cases/queries/list-muscles.use-case';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { MusclesController } from './muscles.controller';

describe('MusclesController', () => {
  let controller: MusclesController;
  const listMusclesMock = { execute: jest.fn() };
  const getMuscleMock = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusclesController],
      providers: [
        { provide: ListMusclesUseCase, useValue: listMusclesMock },
        { provide: GetMuscleUseCase, useValue: getMuscleMock },
      ],
    }).compile();

    controller = module.get<MusclesController>(MusclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('allows anonymous access', () => {
    expect(Reflect.getMetadata('testAllowAnonymous', MusclesController)).toBe(
      true,
    );
  });

  it('delegates list to the list use case', async () => {
    const pagination = new PaginationDto();
    listMusclesMock.execute.mockResolvedValue([{ slug: 'biceps' }]);

    await expect(controller.findAll(pagination)).resolves.toEqual([
      { slug: 'biceps' },
    ]);
    expect(listMusclesMock.execute).toHaveBeenCalledWith(pagination);
  });

  it('delegates details to the get use case', async () => {
    getMuscleMock.execute.mockResolvedValue({ slug: 'biceps' });

    await expect(controller.findOne('biceps')).resolves.toEqual({
      slug: 'biceps',
    });
    expect(getMuscleMock.execute).toHaveBeenCalledWith('biceps');
  });
});
