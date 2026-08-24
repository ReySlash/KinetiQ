import { Prisma } from '../../../../../generated/prisma/client';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import {
  toCreateData,
  toDomain,
  toExercisePerformanceCreateData,
  toCompletedSetCreateData,
} from './prisma-workout-sessions.mapper';

const ownerId = '223e4567-e89b-12d3-a456-426614174000';
const routineId = '323e4567-e89b-12d3-a456-426614174000';
const routineExerciseId = '423e4567-e89b-12d3-a456-426614174000';
const exerciseId = '523e4567-e89b-12d3-a456-426614174000';

function createWorkout(): WorkoutSession {
  const startedAt = new Date('2026-08-25T08:00:00.000Z');
  const workout = WorkoutSession.start({
    ownerId,
    timezone: 'Asia/Qatar',
    startedAt,
    sourceRoutine: {
      id: routineId,
      name: 'Upper A',
      exercises: [
        {
          exerciseId,
          sourceRoutineExerciseId: routineExerciseId,
          exerciseName: 'Bench Press',
          prescription: {
            targetSetCount: 3,
            targetMinReps: 8,
            targetMaxReps: 10,
            targetRir: 2,
            targetRestSeconds: 120,
            targetTempo: '3-1-1-0',
            prescriptionNotes: 'Controlled eccentric',
          },
        },
      ],
    },
  });

  return workout.recordSet(workout.exercisePerformances[0].id.value, {
    repetitions: 10,
    load: '100.25',
    loadUnit: 'KG',
    rir: 2,
    isWarmup: false,
    completedAt: new Date('2026-08-25T08:10:00.000Z'),
  });
}

describe('Prisma workout-session mapper', () => {
  it('maps the aggregate root without leaking nested children into scalar create data', () => {
    const workout = createWorkout();

    expect(toCreateData(workout)).toMatchObject({
      id: workout.id.value,
      ownerId,
      sourceRoutineId: routineId,
      sourceRoutineNameSnapshot: 'Upper A',
      status: 'IN_PROGRESS',
      timezone: 'Asia/Qatar',
      version: 1,
    });
    expect(toCreateData(workout)).not.toHaveProperty('exercisePerformances');
  });

  it('maps prescription snapshots and decimal-safe completed-set values', () => {
    const workout = createWorkout();
    const performance = workout.exercisePerformances[0];
    const completedSet = performance.completedSets[0];

    expect(toExercisePerformanceCreateData(performance)).toMatchObject({
      id: performance.id.value,
      workoutSessionId: workout.id.value,
      exerciseId,
      sourceRoutineExerciseId: routineExerciseId,
      order: 0,
      exerciseNameSnapshot: 'Bench Press',
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      targetRestSeconds: 120,
      targetTempo: '3-1-1-0',
      prescriptionNotes: 'Controlled eccentric',
    });

    expect(toCompletedSetCreateData(completedSet)).toMatchObject({
      id: completedSet.id.value,
      exercisePerformanceId: performance.id.value,
      repetitions: 10,
      loadKg: new Prisma.Decimal('100.25'),
      loadUnit: 'KG',
      rir: 2,
      isWarmup: false,
    });
  });

  it('reconstitutes nested Prisma rows into the domain aggregate with decimal loads as strings', () => {
    const workout = createWorkout();
    const value = workout.toValue();
    const row = {
      ...value,
      exercisePerformances: value.exercisePerformances.map((performance) => ({
        ...performance,
        completedSets: performance.completedSets.map((set) => ({
          ...set,
          loadKg: new Prisma.Decimal(set.loadKg),
        })),
      })),
    };

    const reconstituted = toDomain(row);

    expect(reconstituted.toValue()).toMatchObject({
      id: workout.id.value,
      ownerId,
      sourceRoutineNameSnapshot: 'Upper A',
      version: 1,
    });
    expect(reconstituted.exercisePerformances[0].completedSets[0].loadKg).toBe(
      '100.25',
    );
  });
});
