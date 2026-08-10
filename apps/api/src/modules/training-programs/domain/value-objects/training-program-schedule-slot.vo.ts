import { TrainingProgramScheduleValidationError } from '../errors/training-program.errors';

export class TrainingProgramScheduleSlot {
  private constructor(
    public readonly weekNumber: number,
    public readonly dayNumber: number,
  ) {}

  static create(
    weekNumber: number,
    dayNumber: number,
  ): TrainingProgramScheduleSlot {
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      throw new TrainingProgramScheduleValidationError(
        'Schedule weekNumber must be an integer greater than or equal to 1.',
      );
    }
    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      throw new TrainingProgramScheduleValidationError(
        'Schedule dayNumber must be an integer greater than or equal to 1.',
      );
    }
    return new TrainingProgramScheduleSlot(weekNumber, dayNumber);
  }

  get key(): string {
    return `${this.weekNumber}:${this.dayNumber}`;
  }
}
