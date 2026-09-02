import type { WorkoutSession } from '../../domain/entities/workout-session.entity';

export abstract class WorkoutSessionsCommandPort {
  abstract create(workoutSession: WorkoutSession): Promise<void>;
  /** Implementations must update only when the persisted version equals expectedVersion. */
  abstract update(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void>;
  abstract complete(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void>;
  abstract cancel(
    workoutSession: WorkoutSession,
    expectedVersion: number,
  ): Promise<void>;
}
