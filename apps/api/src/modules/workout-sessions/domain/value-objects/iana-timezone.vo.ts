import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// Represents a timezone identifier using the IANA Time Zone Database.
// Examples: "America/New_York", "Europe/London", "Asia/Tokyo", "UTC"
export class IanaTimezone extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): IanaTimezone {
    const normalized = value.trim();
    if (!normalized) {
      throw new WorkoutSessionValidationError(
        'Workout session timezone is required.',
      );
    }

    // Validates that the timezone is a valid IANA timezone identifier.
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: normalized }).format();
    } catch {
      throw new WorkoutSessionValidationError(
        'Workout session timezone must be a valid IANA timezone.',
      );
    }

    return new IanaTimezone(normalized);
  }
}
