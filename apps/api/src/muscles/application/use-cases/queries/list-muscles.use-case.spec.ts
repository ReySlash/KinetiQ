import type { MusclesQueriesRepository } from '../../ports/muscles-queries.port';
import { ListMusclesUseCase } from './list-muscles.use-case';

describe('ListMusclesUseCase', () => {
  it('applies the current pagination defaults', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const useCase = new ListMusclesUseCase({
      list,
      findBySlug: jest.fn(),
    } satisfies MusclesQueriesRepository);

    await expect(useCase.execute()).resolves.toEqual([]);
    expect(list).toHaveBeenCalledWith({ limit: 20, offset: 0 });
  });
});
