import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { AdoptedTrainingProgramValidationError } from '../errors/adopted-training-program.errors';

export class AdoptedProgramTimestamp extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: Date): AdoptedProgramTimestamp {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new AdoptedTrainingProgramValidationError(
        'Adopted program timestamp is invalid.',
      );
    }
    return new AdoptedProgramTimestamp(value.getTime());
  }

  toDate(): Date {
    return new Date(this.value);
  }

  isBefore(other: AdoptedProgramTimestamp): boolean {
    return this.value < other.value;
  }
}
