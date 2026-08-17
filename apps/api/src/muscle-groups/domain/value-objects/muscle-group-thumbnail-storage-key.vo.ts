import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupThumbnailStorageKey extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupThumbnailStorageKey {
    const normalized = value.trim();
    if (!normalized) {
      throw new MuscleGroupValidationError(
        'Muscle group thumbnailStorageKey cannot be empty.',
      );
    }

    return new MuscleGroupThumbnailStorageKey(normalized);
  }
}
