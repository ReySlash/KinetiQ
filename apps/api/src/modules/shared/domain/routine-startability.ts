export type RoutineAccessProjection = {
  ownerId: string;
  visibility: 'PRIVATE' | 'GLOBAL';
};

export type RoutineExerciseStartabilityProjection = {
  isActive: boolean;
  targetSetCount: number | null;
  targetMinReps: number | null;
  targetMaxReps: number | null;
  targetRir: number | null;
  targetRestSeconds: number | null;
  targetTempo: string | null;
  prescriptionNotes: string | null;
};

export function isRoutineVisibleForOwner(
  routine: RoutineAccessProjection | null,
  ownerId: string,
): boolean {
  return (
    routine?.visibility === 'GLOBAL' ||
    (routine?.visibility === 'PRIVATE' && routine.ownerId === ownerId)
  );
}

export function hasExecutableRoutineExercises(
  exercises: RoutineExerciseStartabilityProjection[],
): boolean {
  return exercises.length > 0 && exercises.every(isExecutableRoutineExercise);
}

export function isRoutineStartableForOwner(
  routine: RoutineAccessProjection | null,
  ownerId: string,
  exercises: RoutineExerciseStartabilityProjection[],
): boolean {
  return (
    isRoutineVisibleForOwner(routine, ownerId) &&
    hasExecutableRoutineExercises(exercises)
  );
}

function isExecutableRoutineExercise(
  exercise: RoutineExerciseStartabilityProjection,
): boolean {
  return (
    exercise.isActive &&
    isIntegerInRange(exercise.targetSetCount, 1, 20) &&
    isIntegerInRange(exercise.targetMinReps, 1, 1000) &&
    isIntegerInRange(exercise.targetMaxReps, 1, 1000) &&
    (exercise.targetMinReps ?? 0) <= (exercise.targetMaxReps ?? 0) &&
    isOptionalIntegerInRange(exercise.targetRir, 0, 10) &&
    isOptionalIntegerInRange(exercise.targetRestSeconds, 0, 3600) &&
    isOptionalTempo(exercise.targetTempo) &&
    isOptionalText(exercise.prescriptionNotes, 1000)
  );
}

function isIntegerInRange(
  value: number | null,
  minimum: number,
  maximum: number,
): boolean {
  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function isOptionalIntegerInRange(
  value: number | null,
  minimum: number,
  maximum: number,
): boolean {
  return value === null || isIntegerInRange(value, minimum, maximum);
}

function isOptionalText(value: string | null, maximum: number): boolean {
  return value === null || value.trim().length <= maximum;
}

function isOptionalTempo(value: string | null): boolean {
  const normalized = value?.trim() ?? null;
  return (
    normalized === null ||
    normalized.length === 0 ||
    (normalized.length <= 30 &&
      /^(?:[0-9]|X)(?:-(?:[0-9]|X)){3}$/.test(normalized))
  );
}
