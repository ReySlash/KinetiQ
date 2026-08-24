export class WorkoutSessionNotFoundError extends Error {
  readonly code = 'WORKOUT_SESSION_NOT_FOUND';

  constructor() {
    super('Workout session not found.');
    this.name = 'WorkoutSessionNotFoundError';
  }
}

export class WorkoutSessionAlreadyActiveError extends Error {
  readonly code = 'WORKOUT_SESSION_ALREADY_ACTIVE';

  constructor() {
    super('An active workout session already exists for this user.');
    this.name = 'WorkoutSessionAlreadyActiveError';
  }
}

export class WorkoutSessionRoutineUnavailableError extends Error {
  readonly code = 'WORKOUT_SESSION_ROUTINE_UNAVAILABLE';

  constructor() {
    super('The requested routine is unavailable.');
    this.name = 'WorkoutSessionRoutineUnavailableError';
  }
}

export class WorkoutSessionExerciseUnavailableError extends Error {
  readonly code = 'WORKOUT_SESSION_EXERCISE_UNAVAILABLE';

  constructor() {
    super('The requested exercise is unavailable.');
    this.name = 'WorkoutSessionExerciseUnavailableError';
  }
}

export class WorkoutSessionPersistenceError extends Error {
  readonly code = 'WORKOUT_SESSION_PERSISTENCE_FAILED';

  constructor() {
    super('Workout session persistence failed.');
    this.name = 'WorkoutSessionPersistenceError';
  }
}

export class WorkoutSessionQueryError extends Error {
  readonly code = 'WORKOUT_SESSION_QUERY_FAILED';

  constructor() {
    super('Workout session query failed.');
    this.name = 'WorkoutSessionQueryError';
  }
}
