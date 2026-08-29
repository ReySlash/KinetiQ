import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { AdoptedTrainingProgramValidationError } from '../errors/adopted-training-program.errors';

export class AdoptedProgramDuration extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): AdoptedProgramDuration {
    if (!Number.isInteger(value) || value < 1) {
      throw new AdoptedTrainingProgramValidationError(
        'Duration weeks snapshot must be a positive integer.',
      );
    }
    return new AdoptedProgramDuration(value);
  }
}
