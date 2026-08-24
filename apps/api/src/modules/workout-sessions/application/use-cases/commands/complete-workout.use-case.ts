import type {
  CompleteWorkoutSessionInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { loadOwnedWorkoutSession } from '../workout-session-aggregate';

export class CompleteWorkoutUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
  ) {}

  async execute(
    input: CompleteWorkoutSessionInput,
  ): Promise<WorkoutSessionCommandResult> {
    const workout = await loadOwnedWorkoutSession(
      {
        ownerId: input.ownerId,
        workoutSessionId: input.workoutSessionId,
      },
      this.queries,
    );
    const completed = workout.complete(input.completedAt);
    await this.commands.update(completed, workout.version);
    return {
      id: completed.id.value,
      status: completed.status,
      updatedAt: completed.updatedAt,
      version: completed.version,
    };
  }
}
