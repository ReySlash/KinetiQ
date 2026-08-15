import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleName {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 100) {
      throw new MuscleValidationError(
        'Muscle name must contain between 2 and 100 characters.',
      );
    }

    return new MuscleName(
      normalized.charAt(0).toUpperCase() + normalized.slice(1),
    );
  }
}
