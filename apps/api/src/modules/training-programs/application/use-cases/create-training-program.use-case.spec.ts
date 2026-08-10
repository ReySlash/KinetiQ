import type { CreateTrainingProgramInput } from '../models/create-training-program.input';
import type { TrainingProgramsRepository } from '../../domain/repositories/training-programs.repository';
import { CreateTrainingProgramUseCase } from './create-training-programs.use-case';

describe('CreateTrainingProgramUseCase', () => {
  it('creates a private program for the supplied owner', async () => {
    const create = jest.fn().mockResolvedValue(undefined);
    const repository: TrainingProgramsRepository = {
      findAll: jest.fn(),
      create,
    };
    const useCase = new CreateTrainingProgramUseCase(repository);
    const input: CreateTrainingProgramInput = {
      ownerId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Strength Base',
      slug: 'strength-base',
      description: 'A simple program',
      durationWeeks: 4,
    };

    const result = await useCase.execute(input);

    expect(create).toHaveBeenCalledWith(result);
    expect(result.toValue()).toMatchObject({
      ownerId: input.ownerId,
      name: input.name,
      visibility: 'PRIVATE',
      durationWeeks: input.durationWeeks,
    });
    expect(result.slug).toMatch(/^strength-base-[a-f0-9]{8}$/);
  });
});
