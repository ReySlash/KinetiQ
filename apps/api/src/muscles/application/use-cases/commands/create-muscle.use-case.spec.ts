import type { CreateMuscleInput } from '../../models/create-muscle.input';
import type { MusclesCommandRepository } from '../../ports/muscles-command.port';
import { CreateMuscleUseCase } from './create-muscle.use-case';

describe('CreateMuscleUseCase', () => {
  it('creates and persists a validated muscle aggregate', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const useCase = new CreateMuscleUseCase({
      create,
      updateBySlug: jest.fn(),
      deactivateById: jest.fn(),
    } satisfies MusclesCommandRepository);
    const input: CreateMuscleInput = {
      name: 'biceps brachii',
      description: 'primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
    };

    const result = await useCase.execute(input);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Biceps brachii',
        slug: 'biceps-brachii',
      }),
    );
    expect(result.slug).toBe('biceps-brachii');
  });
});
