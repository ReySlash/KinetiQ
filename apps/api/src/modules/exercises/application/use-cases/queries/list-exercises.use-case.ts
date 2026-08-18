import type {
  ExerciseListItem,
  ListExercisesQuery,
} from '../../models/list-exercises.models';
import type { ExercisesQueriesPort } from '../../ports/exercises-queries.port';

export class ListExercisesUseCase {
  constructor(private readonly exercises: ExercisesQueriesPort) {}

  execute(input: ListExercisesQuery = {}): Promise<ExerciseListItem[]> {
    return this.exercises.findAll({
      ...input,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }
}
