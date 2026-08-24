import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// WorkoutSessionStatus value object - Represents the status of a workout session
// This ensures that workout sessions can only be in one of three valid states.
export type WorkoutSessionStatusValue =
  'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// WorkoutSessionStatus value object - Represents the status of a workout session
// This ensures that workout sessions can only be in one of three valid states.
// IN_PROGRESS: The workout session is currently active and being performed.
// COMPLETED: The workout session has been completed and all workouts have been finished.
// CANCELLED: The workout session has been cancelled and no further action will be taken.
export class WorkoutSessionStatus extends ValueObject<WorkoutSessionStatusValue> {
  private constructor(value: WorkoutSessionStatusValue) {
    super(value);
  }

  static create(value: string): WorkoutSessionStatus {
    if (
      value !== 'IN_PROGRESS' &&
      value !== 'COMPLETED' &&
      value !== 'CANCELLED'
    ) {
      throw new WorkoutSessionValidationError(
        'Workout session status must be IN_PROGRESS, COMPLETED, or CANCELLED.',
      );
    }
    return new WorkoutSessionStatus(value);
  }
}
