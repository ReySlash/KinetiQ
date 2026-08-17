import type { MusclesCommandPort } from '../../ports/muscles-command.port';
import { UpdateMuscleUseCase } from './update-muscle.use-case';

describe('UpdateMuscleUseCase', () => {
  it('updates by slug with a partial input', async () => {
    const updateBySlug = jest.fn().mockResolvedValue(undefined);
    const useCase = new UpdateMuscleUseCase({
      create: jest.fn(),
      updateBySlug,
      deactivateById: jest.fn(),
    } satisfies MusclesCommandPort);

    await expect(
      useCase.execute('biceps-brachii', { name: 'Biceps' }),
    ).resolves.toEqual({ slug: 'biceps-brachii' });
    expect(updateBySlug).toHaveBeenCalledWith('biceps-brachii', {
      name: 'Biceps',
    });
  });
});
