import { Exercise } from '../../../domain/entities/exercise.entity';
import type { CreateExerciseInput } from '../../models/create-exercise.input';
import type { ExercisesCommandPort } from '../../ports/exercises-command.port';

export class CreateExerciseUseCase {
  constructor(private readonly exercises: ExercisesCommandPort) {}

  async execute(
    input: CreateExerciseInput,
  ): Promise<{ id: string; slug: string }> {
    const exercise = Exercise.create(input);
    await this.exercises.create(exercise);
    return { id: exercise.id.value, slug: exercise.slug };
  }
}
