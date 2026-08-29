export class RoutineNotFoundError extends Error {
  readonly code = 'ROUTINE_NOT_FOUND';
  constructor() {
    super('Routine not found.');
    this.name = 'RoutineNotFoundError';
  }
}

export class RoutineListAuthenticationError extends Error {
  readonly code = 'ROUTINE_LIST_AUTHENTICATION_REQUIRED';
  constructor() {
    super('Authentication is required to list your routines.');
    this.name = 'RoutineListAuthenticationError';
  }
}

export class RoutineExerciseUnavailableError extends Error {
  readonly code = 'ROUTINE_EXERCISE_UNAVAILABLE';
  constructor() {
    super('Every routine exercise must reference an active exercise.');
    this.name = 'RoutineExerciseUnavailableError';
  }
}

export class RoutineInUseError extends Error {
  readonly code = 'ROUTINE_IN_USE';

  constructor() {
    super('Routine is referenced by a training program and cannot be deleted.');
    this.name = 'RoutineInUseError';
  }
}

export class RoutinePersistenceError extends Error {
  readonly code = 'ROUTINE_PERSISTENCE_FAILED';
  constructor() {
    super('Routine persistence failed.');
    this.name = 'RoutinePersistenceError';
  }
}

export class RoutineQueryError extends Error {
  readonly code = 'ROUTINE_QUERY_FAILED';
  constructor() {
    super('Routine query failed.');
    this.name = 'RoutineQueryError';
  }
}
