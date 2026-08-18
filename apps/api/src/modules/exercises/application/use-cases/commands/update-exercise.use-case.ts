import { ExerciseNotFoundError } from '../../errors/exercise.errors';
import type { UpdateExerciseInput } from '../../models/update-exercise.input';
import type { ExercisesCommandPort } from '../../ports/exercises-command.port';

export class UpdateExerciseUseCase {
  constructor(private readonly exercises: ExercisesCommandPort) {}

  async execute(
    id: string,
    input: UpdateExerciseInput,
  ): Promise<{ id: string; slug: string }> {
    const existing = await this.exercises.findById(id);
    if (!existing) {
      throw new ExerciseNotFoundError();
    }

    const updated = existing.update(input);
    await this.exercises.update(updated);
    return { id: updated.id.value, slug: updated.slug };
  }
}
