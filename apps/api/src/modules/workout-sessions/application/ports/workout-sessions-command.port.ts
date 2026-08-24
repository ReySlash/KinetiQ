import type { WorkoutSession } from '../../domain/entities/workout-session.entity';

export abstract class WorkoutSessionsCommandPort {
  abstract create(workoutSession: WorkoutSession): Promise<void>;
  abstract update(workoutSession: WorkoutSession): Promise<void>;
}
