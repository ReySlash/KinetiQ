import type { ExerciseDetail } from '../models/detail-exercise.models';
import type {
  ExerciseListItem,
  ListExercisesQuery,
} from '../models/list-exercises.models';

export abstract class ExercisesQueriesPort {
  abstract findAll(query: ListExercisesQuery): Promise<ExerciseListItem[]>;
  abstract findBySlug(slug: string): Promise<ExerciseDetail | null>;
}
