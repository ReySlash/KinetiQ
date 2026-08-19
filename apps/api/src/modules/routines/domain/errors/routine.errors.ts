export class RoutineValidationError extends Error {
  readonly code = 'ROUTINE_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'RoutineValidationError';
  }
}
