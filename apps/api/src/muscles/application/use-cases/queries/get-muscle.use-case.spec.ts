import { MuscleNotFoundError } from '../../errors/muscle.errors';
import type { MusclesQueriesRepository } from '../../ports/muscles-queries.port';
import { GetMuscleUseCase } from './get-muscle.use-case';

describe('GetMuscleUseCase', () => {
  it('returns the detail projection', async () => {
    const detail = {
      slug: 'biceps-brachii',
    } as never;
    const findBySlug = jest.fn().mockResolvedValue(detail);
    const useCase = new GetMuscleUseCase({
      findBySlug,
      list: jest.fn(),
    } satisfies MusclesQueriesRepository);

    await expect(useCase.execute('biceps-brachii')).resolves.toBe(detail);
    expect(findBySlug).toHaveBeenCalledWith('biceps-brachii');
  });

  it('throws when the muscle is missing', async () => {
    const useCase = new GetMuscleUseCase({
      findBySlug: jest.fn().mockResolvedValue(null),
      list: jest.fn(),
    } satisfies MusclesQueriesRepository);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      MuscleNotFoundError,
    );
  });
});
