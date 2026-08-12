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

export class TrainingProgramQueryError extends Error {
  readonly code = 'TRAINING_PROGRAM_QUERY_FAILED';

  constructor() {
    super('Training program query failed.');
    this.name = 'TrainingProgramQueryError';
  }
}

export class TrainingProgramNotFoundError extends Error {
  readonly code = 'TRAINING_PROGRAM_NOT_FOUND';

  constructor() {
    super('Training program not found.');
    this.name = 'TrainingProgramNotFoundError';
  }
}

export class TrainingProgramRoutineUnavailableError extends Error {
  readonly code = 'TRAINING_PROGRAM_ROUTINE_UNAVAILABLE';

  constructor() {
    super('One or more scheduled routines are unavailable.');
    this.name = 'TrainingProgramRoutineUnavailableError';
  }
}

export class TrainingProgramScheduleConflictError extends Error {
  readonly code = 'TRAINING_PROGRAM_SCHEDULE_CONFLICT';

  constructor() {
    super('A routine already occupies one of the requested program slots.');
    this.name = 'TrainingProgramScheduleConflictError';
  }
}

export class TrainingProgramUpdateConflictError extends Error {
  readonly code = 'TRAINING_PROGRAM_UPDATE_CONFLICT';

  constructor() {
    super(
      'The training program could not be updated because it changed concurrently.',
    );
    this.name = 'TrainingProgramUpdateConflictError';
  }
}

export class TrainingProgramDeletePersistenceError extends Error {
  readonly code = 'TRAINING_PROGRAM_DELETE_PERSISTENCE_FAILED';

  constructor() {
    super('Training program deletion failed.');
    this.name = 'TrainingProgramDeletePersistenceError';
  }
}

export class TrainingProgramListAuthenticationError extends Error {
  readonly code = 'TRAINING_PROGRAM_LIST_AUTHENTICATION_REQUIRED';

  constructor() {
    super('Authentication is required to list your training programs.');
    this.name = 'TrainingProgramListAuthenticationError';
  }
}
