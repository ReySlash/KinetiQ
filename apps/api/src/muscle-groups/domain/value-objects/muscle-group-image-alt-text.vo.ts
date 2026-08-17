import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupImageAltText extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupImageAltText {
    const normalized = value.trim();
    if (!normalized) {
      throw new MuscleGroupValidationError(
        'Muscle group imageAltText cannot be empty.',
      );
    }

    return new MuscleGroupImageAltText(normalized);
  }
}
