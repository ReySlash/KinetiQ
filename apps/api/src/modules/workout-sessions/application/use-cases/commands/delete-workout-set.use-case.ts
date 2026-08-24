import type {
  DeleteWorkoutSetInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { loadOwnedWorkoutSession } from '../workout-session-aggregate';

export class DeleteWorkoutSetUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
  ) {}

  async execute(
    input: DeleteWorkoutSetInput,
  ): Promise<WorkoutSessionCommandResult> {
    const workout = await loadOwnedWorkoutSession(
      {
        ownerId: input.ownerId,
        workoutSessionId: input.workoutSessionId,
      },
      this.queries,
    );
    const updated = workout.deleteSet(
      input.exercisePerformanceId,
      input.completedSetId,
    );
    await this.commands.update(updated, workout.version);
    return {
      id: updated.id.value,
      status: updated.status,
      updatedAt: updated.updatedAt,
      version: updated.version,
    };
  }
}
