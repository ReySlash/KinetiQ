import type { WorkoutSessionDetail } from '../../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { ExistingUuid } from '../../../../shared/domain/value-objects/existing-uuid.vo';

export class GetActiveWorkoutUseCase {
  constructor(private readonly workouts: WorkoutSessionsQueryPort) {}

  execute(ownerId: string): Promise<WorkoutSessionDetail | null> {
    return this.workouts.getActiveDetail(ExistingUuid.create(ownerId).value);
  }
}
