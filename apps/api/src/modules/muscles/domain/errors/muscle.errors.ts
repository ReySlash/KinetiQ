export class MuscleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MuscleValidationError';
  }
}
