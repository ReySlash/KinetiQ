import {
  WorkoutSessionAlreadyActiveError,
  WorkoutSessionRoutineUnavailableError,
} from '../../errors/workout-session.application.errors';
import type {
  StartWorkoutSessionInput,
  WorkoutSessionCommandResult,
} from '../../models/workout-session-command.input';
import type { WorkoutSessionsCommandPort } from '../../ports/workout-sessions-command.port';
import type { WorkoutSessionsQueryPort } from '../../ports/workout-sessions-query.port';
import { WorkoutSession } from '../../../domain/entities/workout-session.entity';
import type { WorkoutSessionSourcesPort } from '../../ports/workout-session-sources.port';
import { ExistingUuid } from '../../../../shared/domain/value-objects/existing-uuid.vo';

export class StartWorkoutUseCase {
  constructor(
    private readonly commands: WorkoutSessionsCommandPort,
    private readonly queries: WorkoutSessionsQueryPort,
    private readonly sources: WorkoutSessionSourcesPort,
  ) {}

  async execute(
    input: StartWorkoutSessionInput,
  ): Promise<WorkoutSessionCommandResult> {
    const ownerId = ExistingUuid.create(input.ownerId).value;
    const active = await this.queries.findActiveByOwner(ownerId);
    if (active) {
      throw new WorkoutSessionAlreadyActiveError();
    }

    const sourceRoutine = input.routineSlug
      ? await this.sources.findRoutineSnapshot(input.routineSlug, ownerId)
      : null;
    if (input.routineSlug && !sourceRoutine) {
      throw new WorkoutSessionRoutineUnavailableError();
    }

    const workout = WorkoutSession.start({
      ownerId,
      timezone: input.timezone,
      startedAt: input.startedAt,
      sourceRoutine,
    });
    await this.commands.create(workout);
    return {
      id: workout.id.value,
      status: workout.status,
      updatedAt: workout.updatedAt,
      version: workout.version,
    };
  }
}
