import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';

export class ExerciseScore extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }
  static create(value: number): ExerciseScore {
    if (!Number.isInteger(value) || value < 0 || value > 5) {
      throw new ExerciseValidationError(
        'Exercise scores must be integers between 0 and 5.',
      );
    }
    return new ExerciseScore(value);
  }
}
