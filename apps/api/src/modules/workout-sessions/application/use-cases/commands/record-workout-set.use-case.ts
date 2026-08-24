import type {
  RecordWorkoutSetInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { loadOwnedWorkoutSession } from '../workout-session-aggregate';

export class RecordWorkoutSetUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
  ) {}

  async execute(
    input: RecordWorkoutSetInput,
  ): Promise<WorkoutSessionCommandResult> {
    const workout = await loadOwnedWorkoutSession(
      {
        ownerId: input.ownerId,
        workoutSessionId: input.workoutSessionId,
      },
      this.queries,
    );
    const updated = workout.recordSet(input.exercisePerformanceId, {
      repetitions: input.repetitions,
      load: input.load,
      loadUnit: input.loadUnit,
      rir: input.rir,
      isWarmup: input.isWarmup,
      completedAt: input.completedAt,
    });
    await this.commands.update(updated, workout.version);
    return {
      id: updated.id.value,
      status: updated.status,
      updatedAt: updated.updatedAt,
      version: updated.version,
    };
  }
}
