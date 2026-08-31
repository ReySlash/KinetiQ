export class AdoptedTrainingProgramScheduleConflictError extends Error {
  constructor() {
    super(
      'The adopted training program schedule conflicts with persisted data.',
    );
    this.name = 'AdoptedTrainingProgramScheduleConflictError';
  }
}

export class AdoptedTrainingProgramPersistenceStateError extends Error {
  constructor() {
    super('The persisted adopted training program state is invalid.');
    this.name = 'AdoptedTrainingProgramPersistenceStateError';
  }
}

export class AdoptedTrainingProgramOwnerReferenceError extends Error {
  constructor() {
    super('The adopted training program owner reference is invalid.');
    this.name = 'AdoptedTrainingProgramOwnerReferenceError';
  }
}

export class AdoptedTrainingProgramSourceProgramReferenceError extends Error {
  constructor() {
    super('The source training program reference is invalid.');
    this.name = 'AdoptedTrainingProgramSourceProgramReferenceError';
  }
}

export class AdoptedTrainingProgramSourceRoutineReferenceError extends Error {
  constructor() {
    super('The source routine reference is invalid.');
    this.name = 'AdoptedTrainingProgramSourceRoutineReferenceError';
  }
}

export class AdoptedTrainingProgramExerciseReferenceError extends Error {
  constructor() {
    super('The source exercise reference is invalid.');
    this.name = 'AdoptedTrainingProgramExerciseReferenceError';
  }
}
