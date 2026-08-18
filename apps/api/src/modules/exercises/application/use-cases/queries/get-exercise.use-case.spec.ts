import { ExerciseNotFoundError } from '../../errors/exercise.errors';
import type { ExercisesQueriesPort } from '../../ports/exercises-queries.port';
import { GetExerciseUseCase } from './get-exercise.use-case';

describe('GetExerciseUseCase', () => {
  it('returns the detail projection by slug', async () => {
    const expected = {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description: 'A compound lower-body movement using a barbell.',
      instructions: 'Brace your trunk, descend under control, then stand tall.',
      commonMistakes: null,
      forceType: 'PUSH' as const,
      kineticChain: 'CLOSED' as const,
      isCompound: true,
      laterality: 'BILATERAL' as const,
      contractionMode: 'DYNAMIC' as const,
      bodyPosition: 'STANDING' as const,
      skillLevel: 'BEGINNER' as const,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      movementPattern: null,
      capabilities: null,
      demands: null,
      muscles: [],
      equipment: [],
    };
    const findBySlug = jest.fn().mockResolvedValue(expected);
    const port: ExercisesQueriesPort = {
      findAll: jest.fn(),
      findBySlug,
    };

    await expect(
      new GetExerciseUseCase(port).execute('barbell-back-squat'),
    ).resolves.toEqual(expected);
    expect(findBySlug).toHaveBeenCalledWith('barbell-back-squat');
  });

  it('throws not found when the query returns null', async () => {
    const port: ExercisesQueriesPort = {
      findAll: jest.fn(),
      findBySlug: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new GetExerciseUseCase(port).execute('missing'),
    ).rejects.toBeInstanceOf(ExerciseNotFoundError);
  });
});
