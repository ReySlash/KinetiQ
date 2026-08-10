export class TrainingProgramValidationError extends Error {
  readonly code = 'TRAINING_PROGRAM_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'TrainingProgramValidationError';
  }
}
