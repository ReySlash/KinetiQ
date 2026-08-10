export class TrainingProgramSlugConflictError extends Error {
  readonly code = 'TRAINING_PROGRAM_SLUG_CONFLICT';

  constructor() {
    super('A training program with this slug already exists.');
    this.name = 'TrainingProgramSlugConflictError';
  }
}

export class TrainingProgramPersistenceError extends Error {
  readonly code = 'TRAINING_PROGRAM_PERSISTENCE_FAILED';

  constructor() {
    super('Training program persistence failed.');
    this.name = 'TrainingProgramPersistenceError';
  }
}
