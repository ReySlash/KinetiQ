import { WorkoutSessionExerciseUnavailableError } from '../../errors/workout-session.application.errors';
import type {
  AddWorkoutExerciseInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import type { WorkoutSessionSourcesPort } from '../../ports/workout-session-sources.port';
import { loadOwnedWorkoutSession } from '../workout-session-aggregate';

export class AddWorkoutExerciseUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
    private readonly sources: WorkoutSessionSourcesPort,
  ) {}

  async execute(
    input: AddWorkoutExerciseInput,
  ): Promise<WorkoutSessionCommandResult> {
    const workout = await loadOwnedWorkoutSession(
      {
        ownerId: input.ownerId,
        workoutSessionId: input.workoutSessionId,
      },
      this.queries,
    );
    const exercise = await this.sources.findActiveExercise(input.exerciseId);
    if (!exercise) {
      throw new WorkoutSessionExerciseUnavailableError();
    }
    const updated = workout.addExercise({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      isExerciseActive: true,
    });
    await this.commands.update(updated);
    return {
      id: updated.id.value,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }
}
