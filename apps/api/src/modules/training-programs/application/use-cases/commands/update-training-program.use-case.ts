import { TrainingProgramNotFoundError } from '../../errors/training-program.errors';
import type { UpdateTrainingProgramInput } from '../../models/update-training-program.input';
import { TrainingProgramsCommandPort } from '../../ports/training-programs-command.port';

export class UpdateTrainingProgramUseCase {
  constructor(private readonly trainingPrograms: TrainingProgramsCommandPort) {}

  async execute(input: UpdateTrainingProgramInput): Promise<{ slug: string }> {
    const existing = await this.trainingPrograms.findOwnedPrivateBySlug(
      input.slug,
      input.ownerId,
    );
    if (!existing) {
      throw new TrainingProgramNotFoundError();
    }

    const { ownerId, slug, ...changes } = input;
    void ownerId;
    void slug;
    const updated = existing.update(changes);
    await this.trainingPrograms.update(updated);
    return { slug: updated.slug };
  }
}
