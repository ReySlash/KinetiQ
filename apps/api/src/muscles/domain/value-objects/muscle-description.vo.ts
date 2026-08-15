import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleDescription extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleDescription {
    const normalized = value.trim();
    if (normalized.length < 10 || normalized.length > 2000) {
      throw new MuscleValidationError(
        'Muscle description must contain between 10 and 2000 characters.',
      );
    }

    return new MuscleDescription(
      normalized.charAt(0).toUpperCase() + normalized.slice(1),
    );
  }
}
