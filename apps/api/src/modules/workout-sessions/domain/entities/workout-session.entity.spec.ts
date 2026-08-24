import {
  WorkoutSessionChildNotFoundError,
  WorkoutSessionStateError,
  WorkoutSessionValidationError,
} from '../errors/workout-session.errors';
import { WorkoutSession } from './workout-session.entity';

const ownerId = '123e4567-e89b-12d3-a456-426614174000';
const routineId = '223e4567-e89b-12d3-a456-426614174000';
const routineExerciseId = '323e4567-e89b-12d3-a456-426614174000';
const benchPressId = '423e4567-e89b-12d3-a456-426614174000';
const rowId = '523e4567-e89b-12d3-a456-426614174000';
const startedAt = new Date('2026-08-24T10:00:00.000Z');

function startFreestyle(): WorkoutSession {
  return WorkoutSession.start({
    ownerId,
    timezone: 'Asia/Qatar',
    startedAt,
  });
}

function startRoutineWorkout(): WorkoutSession {
  return WorkoutSession.start({
    ownerId,
    timezone: 'Asia/Qatar',
    startedAt,
    sourceRoutine: {
      id: routineId,
      name: ' Upper A ',
      exercises: [
        {
          exerciseId: benchPressId,
          sourceRoutineExerciseId: routineExerciseId,
          exerciseName: ' Bench Press ',
          prescription: {
            targetSetCount: 3,
            targetMinReps: 8,
            targetMaxReps: 10,
            targetRir: 2,
            targetRestSeconds: 120,
            targetTempo: '3-1-X-0',
            prescriptionNotes: 'Controlled reps',
          },
        },
      ],
    },
  });
}

function addBenchPress(session = startFreestyle()): WorkoutSession {
  return session.addExercise({
    exerciseId: benchPressId,
    exerciseName: 'Bench Press',
    isExerciseActive: true,
  });
}

function recordBenchPressSet(session = addBenchPress()): WorkoutSession {
  return session.recordSet(session.exercisePerformances[0].id.value, {
    repetitions: 10,
    load: '225',
    loadUnit: 'LB',
    rir: 2,
    completedAt: new Date('2026-08-24T10:10:00.000Z'),
  });
}

describe('WorkoutSession aggregate', () => {
  it('starts an empty freestyle workout in progress', () => {
    const session = startFreestyle();

    expect(session.ownerId).toBe(ownerId);
    expect(session.status).toBe('IN_PROGRESS');
    expect(session.timezone).toBe('Asia/Qatar');
    expect(session.sourceRoutineId).toBeNull();
    expect(session.exercisePerformances).toHaveLength(0);
  });

  it('starts a routine workout with authoritative prescription snapshots', () => {
    const session = startRoutineWorkout();
    const performance = session.exercisePerformances[0];

    expect(session.sourceRoutineId).toBe(routineId);
    expect(session.sourceRoutineNameSnapshot).toBe('Upper A');
    expect(performance.exerciseId).toBe(benchPressId);
    expect(performance.sourceRoutineExerciseId).toBe(routineExerciseId);
    expect(performance.exerciseNameSnapshot).toBe('Bench Press');
    expect(performance.prescription?.value).toEqual({
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      targetRestSeconds: 120,
      targetTempo: '3-1-X-0',
      prescriptionNotes: 'Controlled reps',
    });
  });

  it('requires routine-based performances to have prescription snapshots', () => {
    expect(() =>
      WorkoutSession.start({
        ownerId,
        timezone: 'Asia/Qatar',
        sourceRoutine: {
          id: routineId,
          name: 'Upper A',
          exercises: [
            {
              exerciseId: benchPressId,
              sourceRoutineExerciseId: routineExerciseId,
              exerciseName: 'Bench Press',
            },
          ],
        },
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('requires routine-based performances to retain routine exercise provenance', () => {
    expect(() =>
      WorkoutSession.start({
        ownerId,
        timezone: 'Asia/Qatar',
        sourceRoutine: {
          id: routineId,
          name: 'Upper A',
          exercises: [
            {
              exerciseId: benchPressId,
              sourceRoutineExerciseId: '',
              exerciseName: 'Bench Press',
              prescription: {
                targetSetCount: 3,
                targetMinReps: 8,
                targetMaxReps: 10,
              },
            },
          ],
        },
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('adds active exercises, permits duplicates, and rejects inactive exercises', () => {
    const first = addBenchPress();
    const duplicate = addBenchPress(first);

    expect(duplicate.exercisePerformances.map(({ order }) => order)).toEqual([
      0, 1,
    ]);
    expect(() =>
      duplicate.addExercise({
        exerciseId: rowId,
        exerciseName: 'Row',
        isExerciseActive: false,
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('records canonical load, display unit, warm-up state, and event time', () => {
    const session = addBenchPress();
    const completedAt = new Date('2026-08-24T10:05:00.000Z');
    const recorded = session.recordSet(
      session.exercisePerformances[0].id.value,
      {
        repetitions: 5,
        load: '225',
        loadUnit: 'LB',
        rir: 3,
        isWarmup: true,
        completedAt,
      },
    );
    const set = recorded.exercisePerformances[0].completedSets[0];

    expect(set.loadKg).toBe('102.06');
    expect(set.loadUnit).toBe('LB');
    expect(set.isWarmup).toBe(true);
    expect(set.completedAt).toBe(completedAt);
  });

  it('updates set facts without changing the training-event timestamp', () => {
    const recorded = recordBenchPressSet();
    const performance = recorded.exercisePerformances[0];
    const set = performance.completedSets[0];
    const updated = recorded.updateSet(performance.id.value, set.id.value, {
      repetitions: 9,
      rir: 1,
    });
    const updatedSet = updated.exercisePerformances[0].completedSets[0];

    expect(updatedSet.repetitions).toBe(9);
    expect(updatedSet.rir).toBe(1);
    expect(updatedSet.completedAt).toBe(set.completedAt);
    expect(() =>
      recorded.updateSet(performance.id.value, set.id.value, { load: '100' }),
    ).toThrow(WorkoutSessionValidationError);
    expect(() =>
      recorded.updateSet(performance.id.value, set.id.value, {
        loadUnit: 'KG',
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('normalizes set order after deletion', () => {
    let session = recordBenchPressSet();
    const performanceId = session.exercisePerformances[0].id.value;
    session = session.recordSet(performanceId, {
      repetitions: 8,
      load: '100',
      loadUnit: 'KG',
      completedAt: new Date('2026-08-24T10:15:00.000Z'),
    });
    const firstSetId =
      session.exercisePerformances[0].completedSets[0].id.value;
    const updated = session.deleteSet(performanceId, firstSetId);

    expect(updated.exercisePerformances[0].completedSets).toHaveLength(1);
    expect(updated.exercisePerformances[0].completedSets[0].order).toBe(0);
  });

  it('rejects removing an exercise with sets and normalizes empty exercise order', () => {
    const recorded = recordBenchPressSet();
    expect(() =>
      recorded.removeExercise(recorded.exercisePerformances[0].id.value),
    ).toThrow(WorkoutSessionStateError);

    const twoExercises = addBenchPress().addExercise({
      exerciseId: rowId,
      exerciseName: 'Barbell Row',
      isExerciseActive: true,
    });
    const removed = twoExercises.removeExercise(
      twoExercises.exercisePerformances[0].id.value,
    );
    expect(removed.exercisePerformances[0].order).toBe(0);
    expect(removed.exercisePerformances[0].exerciseId).toBe(rowId);
  });

  it('requires one set for completion and makes completed sessions immutable', () => {
    expect(() => addBenchPress().complete()).toThrow(WorkoutSessionStateError);

    const completionTime = new Date('2026-08-24T11:00:00.000Z');
    const completed = recordBenchPressSet().complete(completionTime);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.completedAt).toBe(completionTime);
    expect(completed.cancelledAt).toBeNull();
    expect(() =>
      completed.addExercise({
        exerciseId: rowId,
        exerciseName: 'Barbell Row',
        isExerciseActive: true,
      }),
    ).toThrow(WorkoutSessionStateError);
    expect(() => completed.cancel()).toThrow(WorkoutSessionStateError);
  });

  it('closes cancelled sessions while retaining their abandoned observations', () => {
    const recorded = recordBenchPressSet();
    const cancelledAt = new Date('2026-08-24T11:00:00.000Z');
    const cancelled = recorded.cancel(cancelledAt);

    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).toBe(cancelledAt);
    expect(cancelled.completedSetCount).toBe(1);
    expect(() =>
      cancelled.deleteSet(
        cancelled.exercisePerformances[0].id.value,
        cancelled.exercisePerformances[0].completedSets[0].id.value,
      ),
    ).toThrow(WorkoutSessionStateError);
  });

  it('does not close a workout before its latest recorded set', () => {
    const recorded = recordBenchPressSet();
    const beforeLatestSet = new Date('2026-08-24T10:09:00.000Z');

    expect(() => recorded.complete(beforeLatestSet)).toThrow(
      WorkoutSessionValidationError,
    );
    expect(() => recorded.cancel(beforeLatestSet)).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('rejects event timestamps before the workout start', () => {
    const session = addBenchPress();
    expect(() =>
      session.recordSet(session.exercisePerformances[0].id.value, {
        repetitions: 1,
        load: '100',
        loadUnit: 'KG',
        completedAt: new Date('2026-08-24T09:59:00.000Z'),
      }),
    ).toThrow(WorkoutSessionValidationError);
    expect(() => session.cancel(new Date('2026-08-24T09:59:00.000Z'))).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('reconstitutes snapshots and identity without depending on source records', () => {
    const completed = recordBenchPressSet(startRoutineWorkout()).complete(
      new Date('2026-08-24T11:00:00.000Z'),
    );
    const persisted = completed.toValue();
    persisted.sourceRoutineId = null;
    persisted.exercisePerformances[0].sourceRoutineExerciseId = null;

    const restored = WorkoutSession.reconstitute(persisted);

    expect(restored.equals(completed)).toBe(true);
    expect(restored.sourceRoutineNameSnapshot).toBe('Upper A');
    expect(restored.exercisePerformances[0].prescription?.value).toEqual(
      completed.exercisePerformances[0].prescription?.value,
    );
  });

  it('normalizes persisted canonical load values during reconstitution', () => {
    const persisted = recordBenchPressSet().toValue();
    persisted.exercisePerformances[0].completedSets[0].loadKg = '102.060';

    const restored = WorkoutSession.reconstitute(persisted);

    expect(restored.exercisePerformances[0].completedSets[0].loadKg).toBe(
      '102.06',
    );
  });

  it('rejects malformed persisted lifecycle and child ordering', () => {
    const session = addBenchPress();
    const invalidLifecycle = session.toValue();
    invalidLifecycle.status = 'COMPLETED';
    invalidLifecycle.completedAt = null;
    expect(() => WorkoutSession.reconstitute(invalidLifecycle)).toThrow(
      WorkoutSessionValidationError,
    );

    const invalidOrder = session.toValue();
    invalidOrder.exercisePerformances[0].order = 1;
    expect(() => WorkoutSession.reconstitute(invalidOrder)).toThrow(
      WorkoutSessionValidationError,
    );

    const missingSnapshot = startRoutineWorkout().toValue();
    const performance = missingSnapshot.exercisePerformances[0];
    performance.targetSetCount = null;
    performance.targetMinReps = null;
    performance.targetMaxReps = null;
    performance.targetRir = null;
    performance.targetRestSeconds = null;
    performance.targetTempo = null;
    performance.prescriptionNotes = null;
    expect(() => WorkoutSession.reconstitute(missingSnapshot)).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('returns safe child-not-found domain errors', () => {
    const session = addBenchPress();
    expect(() => session.removeExercise(rowId)).toThrow(
      WorkoutSessionChildNotFoundError,
    );
  });
});
