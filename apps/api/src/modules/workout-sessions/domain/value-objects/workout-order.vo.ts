import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// WorkoutOrder value object - Represents the order of a workout in a workout session
// This ensures that workouts are executed in the correct sequence
// and prevents duplication of workouts in the same session.
export class WorkoutOrder extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): WorkoutOrder {
    if (!Number.isInteger(value) || value < 0) {
      throw new WorkoutSessionValidationError(
        'Workout order must be a non-negative integer.',
      );
    }
    return new WorkoutOrder(value);
  }
}
