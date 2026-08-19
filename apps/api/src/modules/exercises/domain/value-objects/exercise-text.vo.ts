import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';

function textValue(
  value: string,
  label: string,
  min: number,
  max: number,
): string {
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new ExerciseValidationError(
      `${label} must contain between ${min} and ${max} characters.`,
    );
  }
  return normalized;
}

export class ExerciseName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseName {
    return new ExerciseName(textValue(value, 'Exercise name', 2, 150));
  }
}

export class ExerciseDescription extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseDescription {
    return new ExerciseDescription(
      textValue(value, 'Exercise description', 20, 3000),
    );
  }
}

export class ExerciseInstructions extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseInstructions {
    return new ExerciseInstructions(
      textValue(value, 'Exercise instructions', 20, 10000),
    );
  }
}

export class ExerciseCommonMistakes extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseCommonMistakes {
    return new ExerciseCommonMistakes(
      textValue(value, 'Exercise commonMistakes', 0, 5000),
    );
  }
}

export class ExerciseNotes extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseNotes {
    return new ExerciseNotes(textValue(value, 'Exercise notes', 0, 1000));
  }
}

export class ExerciseEditorialNotes extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseEditorialNotes {
    return new ExerciseEditorialNotes(
      textValue(value, 'Exercise editorialNotes', 0, 5000),
    );
  }
}
