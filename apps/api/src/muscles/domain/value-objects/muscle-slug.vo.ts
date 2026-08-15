import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleSlug extends ValueObject<string> {
  private constructor(slug: string) {
    super(slug);
  }

  static create(value: string): MuscleSlug {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 120) {
      throw new MuscleValidationError(
        'Muscle slug must contain between 2 and 120 characters.',
      );
    }

    const normalized = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!normalized) {
      throw new MuscleValidationError(
        'Muscle slug must contain alphanumeric characters.',
      );
    }

    return new MuscleSlug(normalized);
  }
}
