import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleGroupValidationError } from '../errors/muscle-group.errors';

export class MuscleGroupSlug extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): MuscleGroupSlug {
    const trimmed = value.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      throw new MuscleGroupValidationError(
        'Muscle group slug must contain between 1 and 50 characters.',
      );
    }

    const normalized = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!normalized) {
      throw new MuscleGroupValidationError(
        'Muscle group slug must contain alphanumeric characters.',
      );
    }

    return new MuscleGroupSlug(normalized);
  }
}
