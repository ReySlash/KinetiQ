export class ExerciseValidationError extends Error {
  readonly code = 'EXERCISE_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'ExerciseValidationError';
  }
}
