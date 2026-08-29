export class AdoptedTrainingProgramValidationError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'AdoptedTrainingProgramValidationError';
  }
}

export class AdoptedTrainingProgramLifecycleError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_LIFECYCLE_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'AdoptedTrainingProgramLifecycleError';
  }
}

export class ProgramWorkoutOccurrenceValidationError extends Error {
  readonly code = 'PROGRAM_WORKOUT_OCCURRENCE_VALIDATION_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProgramWorkoutOccurrenceValidationError';
  }
}

export class ProgramWorkoutOccurrenceLifecycleError extends Error {
  readonly code = 'PROGRAM_WORKOUT_OCCURRENCE_LIFECYCLE_FAILED';

  constructor(message: string) {
    super(message);
    this.name = 'ProgramWorkoutOccurrenceLifecycleError';
  }
}
