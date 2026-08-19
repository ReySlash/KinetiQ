import type { ExercisesQueriesPort } from '../../ports/exercises-queries.port';
import { ListExercisesUseCase } from './list-exercises.use-case';

describe('ListExercisesUseCase', () => {
  it('applies pagination defaults and delegates the query', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const port: ExercisesQueriesPort = {
      findAll,
      findBySlug: jest.fn(),
    };

    await expect(
      new ListExercisesUseCase(port).execute({ search: 'squat' }),
    ).resolves.toEqual([]);
    expect(findAll).toHaveBeenCalledWith({
      search: 'squat',
      limit: 20,
      offset: 0,
    });
  });
});
