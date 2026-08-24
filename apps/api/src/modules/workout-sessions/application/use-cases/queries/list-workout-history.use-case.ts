import type {
  WorkoutSessionListItem,
  WorkoutSessionListQuery,
} from '../../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { validateWorkoutHistoryQuery } from '../validation';

export class ListWorkoutHistoryUseCase {
  constructor(private readonly workouts: WorkoutSessionsQueryPort) {}

  execute(query: WorkoutSessionListQuery): Promise<WorkoutSessionListItem[]> {
    return this.workouts.listHistory(validateWorkoutHistoryQuery(query));
  }
}
