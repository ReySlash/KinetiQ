import type {
  CancelWorkoutSessionInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { loadOwnedWorkoutSession } from '../workout-session-aggregate';

export class CancelWorkoutUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
  ) {}

  async execute(
    input: CancelWorkoutSessionInput,
  ): Promise<WorkoutSessionCommandResult> {
    const workout = await loadOwnedWorkoutSession(
      {
        ownerId: input.ownerId,
        workoutSessionId: input.workoutSessionId,
      },
      this.queries,
    );
    const cancelled = workout.cancel(input.cancelledAt);
    await this.commands.update(cancelled, workout.version);
    return {
      id: cancelled.id.value,
      status: cancelled.status,
      updatedAt: cancelled.updatedAt,
      version: cancelled.version,
    };
  }
}
