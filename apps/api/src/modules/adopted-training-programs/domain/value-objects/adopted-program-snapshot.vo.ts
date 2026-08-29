import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import {
  AdoptedTrainingProgramValidationError,
  ProgramWorkoutOccurrenceValidationError,
} from '../errors/adopted-training-program.errors';

export class AdoptedProgramNameSnapshot extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): AdoptedProgramNameSnapshot {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 120) {
      throw new AdoptedTrainingProgramValidationError(
        'Program name snapshot must contain between 2 and 120 characters.',
      );
    }
    return new AdoptedProgramNameSnapshot(normalized);
  }
}

export class RoutineNameSnapshot extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineNameSnapshot {
    const normalized = value.trim();
    if (normalized.length < 1 || normalized.length > 120) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Routine name snapshot must contain between 1 and 120 characters.',
      );
    }
    return new RoutineNameSnapshot(normalized);
  }
}

export class ProgramSlotNotesSnapshot extends ValueObject<string | null> {
  private constructor(value: string | null) {
    super(value);
  }

  static create(value: string | null | undefined): ProgramSlotNotesSnapshot {
    const normalized = value?.trim() || null;
    if (normalized && normalized.length > 1000) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Program slot notes snapshot must contain at most 1,000 characters.',
      );
    }
    return new ProgramSlotNotesSnapshot(normalized);
  }
}
