import type { TrainingProgramsCommandRepository } from '../../repositories/training-programs-command.repository';
import { DeleteTrainingProgramUseCase } from './delete-training-program.use-case';

describe('DeleteTrainingProgramUseCase', () => {
  it('deletes using the authenticated owner scope', async () => {
    const deleteOwnedPrivateBySlug = jest.fn().mockResolvedValue(undefined);
    const repository: TrainingProgramsCommandRepository = {
      create: jest.fn(),
      findOwnedPrivateBySlug: jest.fn(),
      update: jest.fn(),
      deleteOwnedPrivateBySlug,
    };
    const useCase = new DeleteTrainingProgramUseCase(repository);

    await expect(
      useCase.execute({
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'strength-base-12345678',
      }),
    ).resolves.toEqual({ slug: 'strength-base-12345678' });
    expect(deleteOwnedPrivateBySlug).toHaveBeenCalledWith(
      'strength-base-12345678',
      '123e4567-e89b-12d3-a456-426614174000',
    );
  });
});
