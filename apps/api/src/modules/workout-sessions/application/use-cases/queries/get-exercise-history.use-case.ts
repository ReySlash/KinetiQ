import type {
  ExerciseHistoryItem,
  GetExerciseHistoryQuery,
} from '../../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { validateExerciseHistoryQuery } from '../validation';

export class GetExerciseHistoryUseCase {
  constructor(private readonly workouts: WorkoutSessionsQueryPort) {}

  execute(query: GetExerciseHistoryQuery): Promise<ExerciseHistoryItem[]> {
    return this.workouts.findExerciseHistory(
      validateExerciseHistoryQuery(query),
    );
  }
}
