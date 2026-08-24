import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { WorkoutSessionValidationError } from '../../domain/errors/workout-session.errors';
import { validDate } from '../../domain/utils/workout-session.validation';
import type {
  GetExerciseHistoryQuery,
  GetWorkoutSessionQuery,
  WorkoutSessionListQuery,
} from '../models/workout-session-query.model';

export function validateOwnedWorkoutQuery(
  query: GetWorkoutSessionQuery,
): GetWorkoutSessionQuery {
  return {
    ownerId: ExistingUuid.create(query.ownerId).value,
    workoutSessionId: ExistingUuid.create(query.workoutSessionId).value,
  };
}

function validatePage(limit: number, offset: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new WorkoutSessionValidationError(
      'Workout history limit must be an integer between 1 and 100.',
    );
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new WorkoutSessionValidationError(
      'Workout history offset must be a non-negative integer.',
    );
  }
}

function validateDateRange(from: Date | undefined, to: Date | undefined): void {
  if (from) validDate(from, 'Workout history start date');
  if (to) validDate(to, 'Workout history end date');
  if (from && to && from > to) {
    throw new WorkoutSessionValidationError(
      'Workout history start date cannot follow the end date.',
    );
  }
}

export function validateWorkoutHistoryQuery(
  query: WorkoutSessionListQuery,
): WorkoutSessionListQuery {
  ExistingUuid.create(query.ownerId);
  validatePage(query.limit, query.offset);
  validateDateRange(query.from, query.to);
  return query;
}

export function validateExerciseHistoryQuery(
  query: GetExerciseHistoryQuery,
): GetExerciseHistoryQuery {
  ExistingUuid.create(query.ownerId);
  ExistingUuid.create(query.exerciseId);
  validatePage(query.limit, query.offset);
  validateDateRange(query.from, query.to);
  return query;
}
