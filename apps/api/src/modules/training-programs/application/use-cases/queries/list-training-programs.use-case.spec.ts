import { TrainingProgramListAuthenticationError } from '../../errors/training-program.errors';
import type { TrainingProgramsQueryRepository } from '../../ports/training-programs-query.port';
import { ListTrainingProgramsUseCase } from './list-training-programs.use-case';

describe('ListTrainingProgramsUseCase', () => {
  const findAll = jest.fn();
  const repository: TrainingProgramsQueryRepository = {
    findAll,
  };
  const useCase = new ListTrainingProgramsUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
    findAll.mockResolvedValue([]);
  });

  it('defaults to the authenticated user private scope', async () => {
    await expect(
      useCase.execute({ principal: { userId: 'user-id' } }),
    ).resolves.toEqual([]);
    expect(findAll).toHaveBeenCalledWith({
      scope: 'my',
      ownerId: 'user-id',
      sort: 'updatedAt:desc',
      limit: 20,
      offset: 0,
    });
  });

  it('allows anonymous global listing with bounded query options', async () => {
    await useCase.execute({
      principal: null,
      scope: 'global',
      q: 'strength',
      sort: 'name:asc',
      limit: 10,
      offset: 20,
    });
    expect(findAll).toHaveBeenCalledWith({
      scope: 'global',
      q: 'strength',
      sort: 'name:asc',
      limit: 10,
      offset: 20,
    });
  });

  it('requires authentication for the my scope', () => {
    expect(() => useCase.execute({ principal: null })).toThrow(
      TrainingProgramListAuthenticationError,
    );
  });
});
