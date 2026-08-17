import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleSortOrder extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): MuscleSortOrder {
    if (!Number.isInteger(value) || value < 0) {
      throw new MuscleValidationError(
        'Muscle sortOrder must be a non-negative integer.',
      );
    }

    return new MuscleSortOrder(value);
  }
}
