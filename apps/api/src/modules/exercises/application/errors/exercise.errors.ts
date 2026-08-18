export class ExerciseNotFoundError extends Error {
  readonly code = 'EXERCISE_NOT_FOUND';

  constructor() {
    super('Exercise not found.');
    this.name = 'ExerciseNotFoundError';
  }
}

export class ExerciseQueryError extends Error {
  readonly code = 'EXERCISE_QUERY_FAILED';

  constructor() {
    super('Exercise query failed.');
    this.name = 'ExerciseQueryError';
  }
}

export class ExercisePersistenceError extends Error {
  readonly code = 'EXERCISE_PERSISTENCE_FAILED';

  constructor() {
    super('Exercise persistence failed.');
    this.name = 'ExercisePersistenceError';
  }
}

export class ExerciseNameConflictError extends Error {
  readonly code = 'EXERCISE_NAME_CONFLICT';

  constructor() {
    super('An exercise with this name already exists.');
    this.name = 'ExerciseNameConflictError';
  }
}

export class ExerciseSlugConflictError extends Error {
  readonly code = 'EXERCISE_SLUG_CONFLICT';

  constructor() {
    super('An exercise with this slug already exists.');
    this.name = 'ExerciseSlugConflictError';
  }
}

export class ExerciseRelatedRecordError extends Error {
  readonly code = 'EXERCISE_RELATED_RECORD_INVALID';

  constructor() {
    super('Exercise references an unknown record.');
    this.name = 'ExerciseRelatedRecordError';
  }
}
