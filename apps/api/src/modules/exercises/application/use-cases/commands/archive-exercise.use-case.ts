import { ExerciseNotFoundError } from '../../errors/exercise.errors';
import type { ExercisesCommandPort } from '../../ports/exercises-command.port';

export class ArchiveExerciseUseCase {
  constructor(private readonly exercises: ExercisesCommandPort) {}

  async execute(id: string): Promise<{ id: string; archivedAt: Date }> {
    const existing = await this.exercises.findById(id);
    if (!existing) {
      throw new ExerciseNotFoundError();
    }

    const archived = existing.archive();
    await this.exercises.archive(archived);
    return { id: archived.id.value, archivedAt: archived.archivedAt! };
  }
}
