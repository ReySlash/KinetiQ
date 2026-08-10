import type { TrainingProgramsRepository } from '../../domain/repositories/training-programs.repository';
import { ListTrainingProgramsUseCase } from './list-training-programs.use-case';

describe('ListTrainingProgramsUseCase', () => {
  const findAll = jest.fn();
  const repository: TrainingProgramsRepository = {
    findAll,
    create: jest.fn(),
  };
  const useCase = new ListTrainingProgramsUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
    findAll.mockResolvedValue([]);
  });

  it('returns all training programs from the repository', async () => {
    await expect(useCase.execute()).resolves.toEqual([]);
    expect(findAll).toHaveBeenCalledWith();
  });
});
