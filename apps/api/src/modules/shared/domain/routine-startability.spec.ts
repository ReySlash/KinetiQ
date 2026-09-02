import {
  hasExecutableRoutineExercises,
  isRoutineStartableForOwner,
  isRoutineVisibleForOwner,
  type RoutineAccessProjection,
  type RoutineExerciseStartabilityProjection,
} from './routine-startability';

const ownerId = '11111111-1111-4111-8111-111111111111';
const otherOwnerId = '22222222-2222-4222-8222-222222222222';

describe('routine startability', () => {
  it.each([
    [
      'global routine',
      { ownerId: otherOwnerId, visibility: 'GLOBAL' as const },
      ownerId,
      true,
    ],
    [
      'owner private routine',
      { ownerId, visibility: 'PRIVATE' as const },
      ownerId,
      true,
    ],
    [
      'another owner private routine',
      { ownerId: otherOwnerId, visibility: 'PRIVATE' as const },
      ownerId,
      false,
    ],
    ['missing routine', null, ownerId, false],
  ])(
    'evaluates visibility for %s',
    (_label, routine, requestedOwnerId, expected) => {
      expect(isRoutineVisibleForOwner(routine, requestedOwnerId)).toBe(
        expected,
      );
    },
  );

  it.each([
    ['a valid active exercise', validExercise(), true],
    ['an empty routine', null, false],
    ['an inactive exercise', { ...validExercise(), isActive: false }, false],
    [
      'a missing set target',
      { ...validExercise(), targetSetCount: null },
      false,
    ],
    ['an invalid set target', { ...validExercise(), targetSetCount: 0 }, false],
    ['an inverted rep range', { ...validExercise(), targetMinReps: 11 }, false],
    ['an invalid RIR', { ...validExercise(), targetRir: 11 }, false],
    [
      'an invalid rest period',
      { ...validExercise(), targetRestSeconds: 3601 },
      false,
    ],
    ['an invalid tempo', { ...validExercise(), targetTempo: '2-1-0' }, false],
    [
      'overlong prescription notes',
      {
        ...validExercise(),
        prescriptionNotes: 'x'.repeat(1001),
      },
      false,
    ],
  ])('evaluates executable exercises for %s', (_label, exercise, expected) => {
    expect(hasExecutableRoutineExercises(exercise ? [exercise] : [])).toBe(
      expected,
    );
  });

  it('requires both visibility and executable exercises', () => {
    const routine: RoutineAccessProjection = {
      ownerId,
      visibility: 'PRIVATE',
    };

    expect(
      isRoutineStartableForOwner(routine, ownerId, [validExercise()]),
    ).toBe(true);
    expect(
      isRoutineStartableForOwner(routine, otherOwnerId, [validExercise()]),
    ).toBe(false);
    expect(isRoutineStartableForOwner(routine, ownerId, [])).toBe(false);
  });
});

function validExercise(): RoutineExerciseStartabilityProjection {
  return {
    isActive: true,
    targetSetCount: 3,
    targetMinReps: 8,
    targetMaxReps: 10,
    targetRir: null,
    targetRestSeconds: null,
    targetTempo: null,
    prescriptionNotes: null,
  };
}
