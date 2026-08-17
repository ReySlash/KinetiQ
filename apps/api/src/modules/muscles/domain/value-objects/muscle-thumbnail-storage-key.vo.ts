import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleThumbnailStorageKey extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleThumbnailStorageKey {
    const normalized = value.trim();
    if (normalized.length > 512) {
      throw new MuscleValidationError(
        'Muscle thumbnailStorageKey cannot exceed 512 characters.',
      );
    }

    return new MuscleThumbnailStorageKey(normalized);
  }
}
