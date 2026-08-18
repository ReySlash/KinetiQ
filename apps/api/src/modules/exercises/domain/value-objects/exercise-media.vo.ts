import { ValueObject } from '../../../shared/domain/value-objects/value-object.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';

function mediaValue(value: string, label: string, max: number): string {
  const normalized = value.trim();
  if (normalized.length > max) {
    throw new ExerciseValidationError(
      `Exercise ${label} cannot exceed ${max} characters.`,
    );
  }
  return normalized;
}

export class ExerciseThumbnailUrl extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseThumbnailUrl {
    return new ExerciseThumbnailUrl(mediaValue(value, 'thumbnailUrl', 2048));
  }
}

export class ExerciseThumbnailStorageKey extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseThumbnailStorageKey {
    return new ExerciseThumbnailStorageKey(
      mediaValue(value, 'thumbnailStorageKey', 512),
    );
  }
}

export class ExerciseImageAltText extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }
  static create(value: string): ExerciseImageAltText {
    return new ExerciseImageAltText(mediaValue(value, 'imageAltText', 200));
  }
}
