import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { AdoptedTrainingProgramValidationError } from '../errors/adopted-training-program.errors';

export class AdoptedProgramDuration extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): AdoptedProgramDuration {
    if (!Number.isInteger(value) || value < 1 || value > 52) {
      throw new AdoptedTrainingProgramValidationError(
        'Duration weeks snapshot must be an integer between 1 and 52.',
      );
    }
    return new AdoptedProgramDuration(value);
  }

  containsWeek(weekNumber: number): boolean {
    return weekNumber <= this.value;
  }
}
