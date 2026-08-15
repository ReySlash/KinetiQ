import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { MuscleValidationError } from '../errors/muscle.errors';

export class MuscleSlug extends ValueObject<string> {
  private constructor(slug: string) {
    super(slug);
  }

  static create(value: string): MuscleSlug {
    const normalized = value
      .trim()
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
