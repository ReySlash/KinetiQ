import type { CreateTrainingProgramInput } from '../../models/create-training-program.input';
import type { TrainingProgramsCommandRepository } from '../../repositories/training-programs-command.repository';
import { CreateTrainingProgramUseCase } from './create-training-programs.use-case';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';

describe('CreateTrainingProgramUseCase', () => {
  it('creates a private program for the supplied owner', async () => {
    let persisted: TrainingProgram | null = null;
    const repository: TrainingProgramsCommandRepository = {
      create: (program) => {
        persisted = program;
        return Promise.resolve();
      },
      findOwnedPrivateBySlug: jest.fn(),
      update: jest.fn(),
    };
    const useCase = new CreateTrainingProgramUseCase(repository);
    const input: CreateTrainingProgramInput = {
      ownerId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Strength Base',
      slug: 'strength-base',
      description: 'A simple program',
      durationWeeks: 4,
      schedule: [
        {
          routineSlug: 'upper-a-12345678',
          weekNumber: 1,
          dayNumber: 1,
        },
      ],
    };

    const result = await useCase.execute(input);

    expect(persisted).toMatchObject({
      ownerId: input.ownerId,
      name: input.name,
      visibility: 'PRIVATE',
      durationWeeks: input.durationWeeks,
      schedule: [
        expect.objectContaining({
          routineSlug: 'upper-a-12345678',
        }),
      ],
    });
    expect(result.slug).toMatch(/^strength-base-[a-f0-9]{8}$/);
  });
});
