import type { MusclesCommandRepository } from '../../ports/muscles-command.port';
import { DeactivateMuscleUseCase } from './deactivate-muscle.use-case';

describe('DeactivateMuscleUseCase', () => {
  it('soft-deletes by id through the command port', async () => {
    const deactivateById = jest.fn().mockResolvedValue(undefined);
    const useCase = new DeactivateMuscleUseCase({
      create: jest.fn(),
      updateBySlug: jest.fn(),
      deactivateById,
    } satisfies MusclesCommandRepository);

    await expect(useCase.execute('muscle-id')).resolves.toEqual({
      id: 'muscle-id',
    });
    expect(deactivateById).toHaveBeenCalledWith('muscle-id');
  });
});
