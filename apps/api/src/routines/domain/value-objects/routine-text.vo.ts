import { ValueObject } from '../../../modules/shared/domain/value-objects/value-object.vo';
import { RoutineValidationError } from '../errors/routine.errors';

function textValue(
  value: string,
  label: string,
  min: number,
  max: number,
): string {
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new RoutineValidationError(
      `${label} must contain between ${min} and ${max} characters.`,
    );
  }
  return normalized;
}

export class RoutineName extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineName {
    return new RoutineName(textValue(value, 'Routine name', 2, 120));
  }
}

export class RoutineDescription extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineDescription {
    return new RoutineDescription(
      textValue(value, 'Routine description', 0, 2000),
    );
  }
}

export class RoutineExerciseSlug extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineExerciseSlug {
    return new RoutineExerciseSlug(
      textValue(value, 'Routine exercise slug', 1, 120),
    );
  }
}

export class RoutineNotes extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoutineNotes {
    return new RoutineNotes(textValue(value, 'Routine notes', 0, 1000));
  }
}
