import type { PrimitiveWorkoutSession } from '../../domain/entities/workout-session.types';
import type {
  ExerciseHistoryItem,
  GetExerciseHistoryQuery,
  GetWorkoutSessionQuery,
  WorkoutSessionDetail,
  WorkoutSessionListItem,
  WorkoutSessionListQuery,
} from '../models/workout-session-query.model';

export abstract class WorkoutSessionsQueryPort {
  abstract findOwnedById(
    query: GetWorkoutSessionQuery,
  ): Promise<PrimitiveWorkoutSession | null>;

  abstract findActiveByOwner(
    ownerId: string,
  ): Promise<PrimitiveWorkoutSession | null>;

  abstract getActiveDetail(
    ownerId: string,
  ): Promise<WorkoutSessionDetail | null>;

  abstract listHistory(
    query: WorkoutSessionListQuery,
  ): Promise<WorkoutSessionListItem[]>;

  abstract findExerciseHistory(
    query: GetExerciseHistoryQuery,
  ): Promise<ExerciseHistoryItem[]>;

  abstract getDetail(
    query: GetWorkoutSessionQuery,
  ): Promise<WorkoutSessionDetail | null>;
}
