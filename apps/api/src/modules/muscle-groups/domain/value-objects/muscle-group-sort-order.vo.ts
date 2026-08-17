import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupSortOrder extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): MuscleGroupSortOrder {
    if (!Number.isInteger(value) || value < 0) {
      throw new MuscleGroupValidationError(
        'Muscle group sortOrder must be a non-negative integer.',
      );
    }

    return new MuscleGroupSortOrder(value);
  }
}
