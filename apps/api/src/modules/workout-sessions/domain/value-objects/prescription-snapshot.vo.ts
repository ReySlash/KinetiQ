import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { WorkoutSessionValidationError } from '../errors/workout-session.errors';

// Represents the prescription details captured at the time a workout session was completed.
export type PrescriptionSnapshotValue = {
  targetSetCount: number;
  targetMinReps: number;
  targetMaxReps: number;
  targetRir: number | null;
  targetRestSeconds: number | null;
  targetTempo: string | null;
  prescriptionNotes: string | null;
};

// Represents the prescription details captured at the time a workout session was completed.
export type PrescriptionSnapshotAttributes = {
  targetSetCount: number;
  targetMinReps: number;
  targetMaxReps: number;
  targetRir?: number | null;
  targetRestSeconds?: number | null;
  targetTempo?: string | null;
  prescriptionNotes?: string | null;
};

// Validates that a value is an integer within the specified range.
function integerInRange(
  value: number,
  minimum: number,
  maximum: number,
  message: string,
): number {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new WorkoutSessionValidationError(message);
  }
  return value;
}

// Validates that a value is a string with a maximum length.
function optionalText(
  value: string | null | undefined,
  maximum: number,
  label: string,
): string | null {
  if (value === undefined || value === null) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maximum) {
    throw new WorkoutSessionValidationError(
      `${label} must contain at most ${maximum} characters.`,
    );
  }
  return normalized;
}

// Validates that a value is a number between 0 and 10.
function optionalRir(value: number | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  return integerInRange(
    value,
    0,
    10,
    'Prescription target RIR must be an integer between 0 and 10.',
  );
}

// Validates that a value is a number between 0 and 3600.
function optionalRest(value: number | null | undefined): number | null {
  if (value === undefined || value === null) return null;
  return integerInRange(
    value,
    0,
    3600,
    'Prescription rest must be an integer between 0 and 3600 seconds.',
  );
}

// Validates that a value is a tempo string in the format "X-X-X-X" where X is a number or "X".
// Example: "2-1-0-X" means 2 seconds eccentric, 1 second concentric, 0 seconds isometric, and X for rest.
function optionalTempo(value: string | null | undefined): string | null {
  const normalized = optionalText(value, 30, 'Prescription tempo');
  if (
    normalized !== null &&
    !/^(?:[0-9]|X)(?:-(?:[0-9]|X)){3}$/.test(normalized)
  ) {
    throw new WorkoutSessionValidationError(
      'Prescription tempo must contain four segments separated by hyphens.',
    );
  }
  return normalized;
}

// PrescriptionSnapshot value object - Immutable snapshot of prescription at workout session creation
// This ensures that the prescription details remain consistent even if the original prescription is modified later and prevents drift in workout session tracking.
export class PrescriptionSnapshot extends ValueObject<PrescriptionSnapshotValue> {
  private constructor(value: PrescriptionSnapshotValue) {
    super(Object.freeze({ ...value }));
  }

  static create(
    attributes: PrescriptionSnapshotAttributes,
  ): PrescriptionSnapshot {
    const targetMinReps = integerInRange(
      attributes.targetMinReps,
      1,
      1000,
      'Prescription minimum reps must be an integer between 1 and 1000.',
    );
    const targetMaxReps = integerInRange(
      attributes.targetMaxReps,
      1,
      1000,
      'Prescription maximum reps must be an integer between 1 and 1000.',
    );
    if (targetMinReps > targetMaxReps) {
      throw new WorkoutSessionValidationError(
        'Prescription minimum reps must be less than or equal to maximum reps.',
      );
    }

    return new PrescriptionSnapshot({
      targetSetCount: integerInRange(
        attributes.targetSetCount,
        1,
        20,
        'Prescription set count must be an integer between 1 and 20.',
      ),
      targetMinReps,
      targetMaxReps,
      targetRir: optionalRir(attributes.targetRir),
      targetRestSeconds: optionalRest(attributes.targetRestSeconds),
      targetTempo: optionalTempo(attributes.targetTempo),
      prescriptionNotes: optionalText(
        attributes.prescriptionNotes,
        1000,
        'Prescription notes',
      ),
    });
  }
}
