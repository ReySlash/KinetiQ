type RoutineAccessProjection = {
  ownerId: string;
  visibility: 'PRIVATE' | 'GLOBAL';
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

export function isRoutineStartableForOwner(
  routine: RoutineAccessProjection | null,
  ownerId: string,
  hasInactiveExercises: boolean,
): boolean {
  return (
    isRoutineVisibleForOwner(routine, ownerId) &&
    !hasInactiveExercises &&
    routine !== null
  );
}
