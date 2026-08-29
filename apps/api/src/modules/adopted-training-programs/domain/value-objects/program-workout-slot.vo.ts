import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ProgramWorkoutOccurrenceValidationError } from '../errors/adopted-training-program.errors';

type ProgramWorkoutSlotValue = {
  weekNumber: number;
  dayNumber: number;
};

export class ProgramWorkoutSlot extends ValueObject<ProgramWorkoutSlotValue> {
  private constructor(value: ProgramWorkoutSlotValue) {
    super(value);
  }

  static create(weekNumber: number, dayNumber: number): ProgramWorkoutSlot {
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Occurrence weekNumber must be a positive integer.',
      );
    }
    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Occurrence dayNumber must be a positive integer.',
      );
    }
    return new ProgramWorkoutSlot({ weekNumber, dayNumber });
  }

  get weekNumber(): number {
    return this.value.weekNumber;
  }

  get dayNumber(): number {
    return this.value.dayNumber;
  }

  get key(): string {
    return `${this.weekNumber}:${this.dayNumber}`;
  }
}
