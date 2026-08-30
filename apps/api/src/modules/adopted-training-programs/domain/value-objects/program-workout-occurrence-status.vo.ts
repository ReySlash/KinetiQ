import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ProgramWorkoutOccurrenceValidationError } from '../errors/adopted-training-program.errors';
export type ProgramWorkoutOccurrenceStatusValue =
  'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export class ProgramWorkoutOccurrenceStatus extends ValueObject<ProgramWorkoutOccurrenceStatusValue> {
  private constructor(value: ProgramWorkoutOccurrenceStatusValue) {
    super(value);
  }

  static create(value: string): ProgramWorkoutOccurrenceStatus {
    if (!isProgramWorkoutOccurrenceStatus(value)) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Program workout occurrence status is invalid.',
      );
    }
    return new ProgramWorkoutOccurrenceStatus(value);
  }
}

function isProgramWorkoutOccurrenceStatus(
  value: string,
): value is ProgramWorkoutOccurrenceStatusValue {
  return ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].includes(value);
}
