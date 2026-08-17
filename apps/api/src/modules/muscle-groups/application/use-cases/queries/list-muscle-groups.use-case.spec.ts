import type { MuscleGroupsQueriesPort } from '../../ports/muscle-groups-queries.port';
import { ListMuscleGroupsUseCase } from './list-muscle-groups.use-case';

describe('ListMuscleGroupsUseCase', () => {
  it('delegates to the query port', async () => {
    const expected = [
      {
        name: 'Upper body',
        slug: 'upper-body',
        description: null,
        sortOrder: 0,
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [],
      },
    ];
    const findAll = jest.fn().mockResolvedValue(expected);
    const queries: MuscleGroupsQueriesPort = {
      findAll,
      findBySlug: jest.fn(),
    };
    const useCase = new ListMuscleGroupsUseCase(queries);

    await expect(useCase.execute()).resolves.toEqual(expected);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
