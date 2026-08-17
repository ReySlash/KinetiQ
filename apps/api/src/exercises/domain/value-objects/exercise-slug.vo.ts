import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';

export class ExerciseSlug extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ExerciseSlug {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (normalized.length < 2 || normalized.length > 180) {
      throw new ExerciseValidationError(
        'Exercise slug must contain between 2 and 180 characters.',
      );
    }
    return new ExerciseSlug(normalized);
  }
}
