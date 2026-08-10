import { TrainingProgramValidationError } from '../errors/training-program.errors';

export class TrainingProgramDuration {
  private constructor(private readonly weeks: number) {}

  static create(value: number): TrainingProgramDuration {
    if (!Number.isInteger(value) || value < 1) {
      throw new TrainingProgramValidationError(
        'Training program duration must be a positive integer.',
      );
    }

    return new TrainingProgramDuration(value);
  }

  get value(): number {
    return this.weeks;
  }
}
