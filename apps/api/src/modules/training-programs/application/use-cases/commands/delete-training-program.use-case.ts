import { TrainingProgramsCommandRepository } from '../../repositories/training-programs-command.repository';

export class DeleteTrainingProgramUseCase {
  constructor(
    private readonly trainingPrograms: TrainingProgramsCommandRepository,
  ) {}

  async execute(input: {
    ownerId: string;
    slug: string;
  }): Promise<{ slug: string }> {
    await this.trainingPrograms.deleteOwnedPrivateBySlug(
      input.slug,
      input.ownerId,
    );
    return { slug: input.slug };
  }
}
