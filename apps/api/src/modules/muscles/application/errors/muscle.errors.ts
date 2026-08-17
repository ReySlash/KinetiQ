export class MuscleNotFoundError extends Error {
  readonly code = 'MUSCLE_NOT_FOUND';

  constructor() {
    super('Muscle not found.');
    this.name = 'MuscleNotFoundError';
  }
}

export class MuscleNameConflictError extends Error {
  readonly code = 'MUSCLE_NAME_CONFLICT';

  constructor() {
    super('A muscle with this name already exists.');
    this.name = 'MuscleNameConflictError';
  }
}

export class MuscleSlugConflictError extends Error {
  readonly code = 'MUSCLE_SLUG_CONFLICT';

  constructor() {
    super('A muscle with this slug already exists.');
    this.name = 'MuscleSlugConflictError';
  }
}

export class MusclePersistenceError extends Error {
  readonly code = 'MUSCLE_PERSISTENCE_FAILED';

  constructor() {
    super('Muscle persistence failed.');
    this.name = 'MusclePersistenceError';
  }
}

export class MuscleQueryError extends Error {
  readonly code = 'MUSCLE_QUERY_FAILED';

  constructor() {
    super('Muscle query failed.');
    this.name = 'MuscleQueryError';
  }
}
