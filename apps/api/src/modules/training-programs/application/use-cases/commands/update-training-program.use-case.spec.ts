import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import type { TrainingProgramsCommandRepository } from '../../ports/training-programs-command.port';
import { UpdateTrainingProgramUseCase } from './update-training-program.use-case';

describe('UpdateTrainingProgramUseCase', () => {
  const findOwnedPrivateBySlug = jest.fn();
  const update = jest.fn();
  const repository: TrainingProgramsCommandRepository = {
    create: jest.fn(),
    findOwnedPrivateBySlug,
    update,
    deleteOwnedPrivateBySlug: jest.fn(),
  };
  const useCase = new UpdateTrainingProgramUseCase(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves omitted fields through the aggregate update', async () => {
    const existing = TrainingProgram.create({
      ownerId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Original Name',
      description: 'Original description',
      durationWeeks: 4,
    });
    findOwnedPrivateBySlug.mockResolvedValue(existing);
    update.mockResolvedValue(undefined);

    await expect(
      useCase.execute({
        ownerId: existing.ownerId,
        slug: existing.slug,
        durationWeeks: 6,
      }),
    ).resolves.toEqual({ slug: existing.slug });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Original Name',
        description: 'Original description',
        durationWeeks: 6,
        slug: existing.slug,
      }),
    );
  });
});
