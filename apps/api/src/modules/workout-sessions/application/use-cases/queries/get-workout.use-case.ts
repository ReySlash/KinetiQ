import { WorkoutSessionNotFoundError } from '../../errors/workout-session.application.errors';
import type {
  GetWorkoutSessionQuery,
  WorkoutSessionDetail,
} from '../../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';

export class GetWorkoutUseCase {
  constructor(private readonly workouts: WorkoutSessionsQueryPort) {}

  async execute(input: GetWorkoutSessionQuery): Promise<WorkoutSessionDetail> {
    const workout = await this.workouts.getDetail(input);
    if (!workout) {
      throw new WorkoutSessionNotFoundError();
    }
    return workout;
  }
}
