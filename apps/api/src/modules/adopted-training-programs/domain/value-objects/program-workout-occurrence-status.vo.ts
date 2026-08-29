import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ProgramWorkoutOccurrenceValidationError } from '../errors/adopted-training-program.errors';

export type ProgramWorkoutOccurrenceStatusValue =
  'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export class ProgramWorkoutOccurrenceStatus extends ValueObject<ProgramWorkoutOccurrenceStatusValue> {
  private constructor(value: ProgramWorkoutOccurrenceStatusValue) {
    super(value);
  }

  static create(value: string): ProgramWorkoutOccurrenceStatus {
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].includes(value)) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Program workout occurrence status is invalid.',
      );
    }
    return new ProgramWorkoutOccurrenceStatus(
      value as ProgramWorkoutOccurrenceStatusValue,
    );
  }
}
