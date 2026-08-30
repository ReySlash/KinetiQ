export class AdoptedTrainingProgramNotFoundError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_NOT_FOUND';

  constructor() {
    super('Adopted training program not found.');
    this.name = 'AdoptedTrainingProgramNotFoundError';
  }
}

export class AdoptedTrainingProgramSourceNotFoundError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_SOURCE_NOT_FOUND';

  constructor() {
    super('Training program not found.');
    this.name = 'AdoptedTrainingProgramSourceNotFoundError';
  }
}

export class AdoptedTrainingProgramSourceUnavailableError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE';

  constructor() {
    super('The source routine is unavailable.');
    this.name = 'AdoptedTrainingProgramSourceUnavailableError';
  }
}

export class AdoptedTrainingProgramEmptyScheduleError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_EMPTY_SCHEDULE';

  constructor() {
    super('A training program must contain at least one scheduled routine.');
    this.name = 'AdoptedTrainingProgramEmptyScheduleError';
  }
}

export class AdoptedTrainingProgramAlreadyNonTerminalError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL';

  constructor() {
    super('A non-terminal adopted training program already exists.');
    this.name = 'AdoptedTrainingProgramAlreadyNonTerminalError';
  }
}

export class AdoptedTrainingProgramPersistenceError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_PERSISTENCE_FAILED';

  constructor() {
    super('Adopted training program persistence failed.');
    this.name = 'AdoptedTrainingProgramPersistenceError';
  }
}

export class AdoptedTrainingProgramQueryError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_QUERY_FAILED';

  constructor() {
    super('Adopted training program query failed.');
    this.name = 'AdoptedTrainingProgramQueryError';
  }
}

export class AdoptedTrainingProgramConcurrencyError extends Error {
  readonly code = 'ADOPTED_TRAINING_PROGRAM_CONCURRENCY_CONFLICT';

  constructor() {
    super(
      'The adopted training program changed before this operation completed.',
    );
    this.name = 'AdoptedTrainingProgramConcurrencyError';
  }
}
