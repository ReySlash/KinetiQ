import type { WorkoutSessionDetail } from '../../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';

export class GetActiveWorkoutUseCase {
  constructor(private readonly workouts: WorkoutSessionsQueryPort) {}

  execute(ownerId: string): Promise<WorkoutSessionDetail | null> {
    return this.workouts.getActiveDetail(ownerId);
  }
}
