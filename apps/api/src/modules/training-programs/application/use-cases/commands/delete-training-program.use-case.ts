import { TrainingProgramsCommandRepository } from '../../ports/training-programs-command.port';

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
