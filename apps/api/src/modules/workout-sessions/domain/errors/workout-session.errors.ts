// Domain-level validation errors for workout sessions
export class WorkoutSessionValidationError extends Error {
  readonly code = 'WORKOUT_SESSION_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'WorkoutSessionValidationError';
  }
}

// Domain-level state errors for workout sessions
export class WorkoutSessionStateError extends Error {
  readonly code = 'WORKOUT_SESSION_STATE_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'WorkoutSessionStateError';
  }
}

// Domain-level child not found errors for workout sessions
export class WorkoutSessionChildNotFoundError extends Error {
  readonly code = 'WORKOUT_SESSION_CHILD_NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'WorkoutSessionChildNotFoundError';
  }
}
