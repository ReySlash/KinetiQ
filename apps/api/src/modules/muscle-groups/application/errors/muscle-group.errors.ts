export class MuscleGroupNotFoundError extends Error {
  readonly code = 'MUSCLE_GROUP_NOT_FOUND';

  constructor() {
    super('Muscle group not found.');
    this.name = 'MuscleGroupNotFoundError';
  }
}

export class MuscleGroupQueryError extends Error {
  readonly code = 'MUSCLE_GROUP_QUERY_FAILED';

  constructor() {
    super('Muscle group query failed.');
    this.name = 'MuscleGroupQueryError';
  }
}
