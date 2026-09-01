import { ProgramWorkoutOccurrenceValidationError } from '../errors/adopted-training-program.errors';

export class ProgramWorkoutSlot {
  private constructor(
    public readonly weekNumber: number,
    public readonly dayNumber: number,
  ) {}

  static create(weekNumber: number, dayNumber: number): ProgramWorkoutSlot {
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Occurrence weekNumber must be a positive integer.',
      );
    }
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 364) {
      throw new ProgramWorkoutOccurrenceValidationError(
        'Occurrence dayNumber must be an integer between 1 and 364.',
      );
    }
    return new ProgramWorkoutSlot(weekNumber, dayNumber);
  }

  get key(): string {
    return `${this.weekNumber}:${this.dayNumber}`;
  }
}
