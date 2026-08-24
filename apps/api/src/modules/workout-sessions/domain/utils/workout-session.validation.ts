import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// Validation utility functions for workout session domain
export function validDate(value: Date, label: string): Date {
  // Ensure the value is a valid Date object
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new WorkoutSessionValidationError(`${label} must be a valid date.`);
  }
  return value;
}

// Ensure the value is a valid UUID or null
export function optionalUuid(value: string | null | undefined): string | null {
  return value === undefined || value === null
    ? null
    : ExistingUuid.create(value).value;
}

// Validate audit timestamps to ensure they are valid dates and updatedAt is not before createdAt
// This prevents data integrity issues where timestamps are incorrectly ordered.
export function validateAuditTimestamps(
  createdAt: Date,
  updatedAt: Date,
  label: string,
): void {
  validDate(createdAt, `${label} createdAt`);
  validDate(updatedAt, `${label} updatedAt`);
  if (updatedAt < createdAt) {
    throw new WorkoutSessionValidationError(
      `${label} updatedAt cannot precede createdAt.`,
    );
  }
}

export function validVersion(
  value: number,
  label = 'Workout session version',
): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new WorkoutSessionValidationError(
      `${label} must be a non-negative integer.`,
    );
  }
  return value;
}
