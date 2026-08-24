import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// Normalizes a string value by trimming whitespace and validating length constraints.
function normalizedName(
  value: string,
  label: string,
  minimum: number,
  maximum: number,
): string {
  const normalized = value.trim();
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new WorkoutSessionValidationError(
      `${label} must contain between ${minimum} and ${maximum} characters.`,
    );
  }
  return normalized;
}

// Represents the name of an exercise at the time a workout session was completed.
export class ExerciseNameSnapshot extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ExerciseNameSnapshot {
    return new ExerciseNameSnapshot(
      normalizedName(value, 'Exercise name snapshot', 2, 150),
    );
  }
}

// Represents the name of a routine at the time a workout session was completed.
export class RoutineNameSnapshot extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineNameSnapshot {
    return new RoutineNameSnapshot(
      normalizedName(value, 'Routine name snapshot', 2, 120),
    );
  }
}
