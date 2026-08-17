import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupThumbnailUrl extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupThumbnailUrl {
    const normalized = value.trim();
    if (!normalized) {
      throw new MuscleGroupValidationError(
        'Muscle group thumbnailUrl cannot be empty.',
      );
    }

    return new MuscleGroupThumbnailUrl(normalized);
  }
}
