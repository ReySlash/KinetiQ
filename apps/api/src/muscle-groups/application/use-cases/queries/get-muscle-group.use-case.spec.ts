import { MuscleGroupNotFoundError } from '../../errors/muscle-group.errors';
import type { MuscleGroupsQueriesPort } from '../../ports/muscle-groups-queries.port';
import { GetMuscleGroupUseCase } from './get-muscle-group.use-case';

describe('GetMuscleGroupUseCase', () => {
  it('returns the detail projection from the query port', async () => {
    const expected = {
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Upper body',
      slug: 'upper-body',
      description: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      bodyRegion: 'UPPER_BODY' as const,
      muscles: [],
    };
    const findBySlug = jest.fn().mockResolvedValue(expected);
    const queries: MuscleGroupsQueriesPort = {
      findAll: jest.fn(),
      findBySlug,
    };
    const useCase = new GetMuscleGroupUseCase(queries);

    await expect(useCase.execute('upper-body')).resolves.toEqual(expected);
    expect(findBySlug).toHaveBeenCalledWith('upper-body');
  });

  it('throws not found when the query port returns null', async () => {
    const queries: MuscleGroupsQueriesPort = {
      findAll: jest.fn(),
      findBySlug: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetMuscleGroupUseCase(queries);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      MuscleGroupNotFoundError,
    );
  });
});
