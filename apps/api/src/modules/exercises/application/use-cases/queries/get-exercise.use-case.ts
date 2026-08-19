import { ExerciseNotFoundError } from '../../errors/exercise.errors';
import type { ExerciseDetail } from '../../models/detail-exercise.models';
import type { ExercisesQueriesPort } from '../../ports/exercises-queries.port';

export class GetExerciseUseCase {
  constructor(private readonly exercises: ExercisesQueriesPort) {}

  async execute(slug: string): Promise<ExerciseDetail> {
    const exercise = await this.exercises.findBySlug(slug);
    if (!exercise) {
      throw new ExerciseNotFoundError();
    }
    return exercise;
  }
}
