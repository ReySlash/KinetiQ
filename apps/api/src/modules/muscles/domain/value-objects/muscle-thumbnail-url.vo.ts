import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleThumbnailUrl extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleThumbnailUrl {
    const normalized = value.trim();
    if (normalized.length > 2048) {
      throw new MuscleValidationError(
        'Muscle thumbnailUrl cannot exceed 2048 characters.',
      );
    }

    return new MuscleThumbnailUrl(normalized);
  }
}
