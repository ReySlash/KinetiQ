export class MuscleGroupValidationError extends Error {
  readonly code = 'MUSCLE_GROUP_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'MuscleGroupValidationError';
  }
}
