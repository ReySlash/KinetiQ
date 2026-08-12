import { TrainingProgramNotFoundError } from '../../errors/training-program.errors';
import type { TrainingProgramDetail } from '../../models/detail-training-program.model';
import type { TrainingProgramsQueryRepository } from '../../repositories/training-programs-query.repository';
import { GetTrainingProgramUseCase } from './get-training-program.use-case';

describe('GetTrainingProgramUseCase', () => {
  const findBySlug = jest.fn();
  const repository: TrainingProgramsQueryRepository = {
    findAll: jest.fn(),
    findBySlug,
  };
  const useCase = new GetTrainingProgramUseCase(repository);

  beforeEach(() => jest.clearAllMocks());

  it('returns the accessible detail projection', async () => {
    const detail = { slug: 'strength-base-12345678' } as TrainingProgramDetail;
    findBySlug.mockResolvedValue(detail);

    await expect(
      useCase.execute({
        slug: detail.slug,
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
      }),
    ).resolves.toBe(detail);
  });

  it('conceals missing and inaccessible programs as not found', async () => {
    findBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute({ slug: 'missing-program' }),
    ).rejects.toBeInstanceOf(TrainingProgramNotFoundError);
  });
});
