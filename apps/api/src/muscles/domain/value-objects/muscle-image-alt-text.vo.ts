import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleImageAltText extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleImageAltText {
    const normalized = value.trim();
    if (normalized.length > 200) {
      throw new MuscleValidationError(
        'Muscle imageAltText cannot exceed 200 characters.',
      );
    }

    return new MuscleImageAltText(normalized);
  }
}
