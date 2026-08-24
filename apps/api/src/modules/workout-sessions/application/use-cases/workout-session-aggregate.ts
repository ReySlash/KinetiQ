import { WorkoutSessionNotFoundError } from '../errors/workout-session.application.errors';
import type { GetWorkoutSessionQuery } from '../models/workout-session-query.model';
import type { WorkoutSessionsQueryPort } from '../ports/workout-sessions-query.port';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';

export async function loadOwnedWorkoutSession(
  query: GetWorkoutSessionQuery,
  workouts: WorkoutSessionsQueryPort,
): Promise<WorkoutSession> {
  const persisted = await workouts.findOwnedById(query);
  if (!persisted) {
    throw new WorkoutSessionNotFoundError();
  }
  return WorkoutSession.reconstitute(persisted);
}
