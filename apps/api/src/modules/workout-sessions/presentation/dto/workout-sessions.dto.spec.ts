import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddWorkoutExerciseDto } from './add-workout-exercise.dto';
import { CancelWorkoutDto } from './cancel-workout.dto';
import { CompleteWorkoutDto } from './complete-workout.dto';
import { DeleteWorkoutSetDto } from './delete-workout-set.dto';
import { GetExerciseHistoryQueryDto } from './get-exercise-history-query.dto';
import { ListWorkoutHistoryQueryDto } from './list-workout-history-query.dto';
import { RecordWorkoutSetDto } from './record-workout-set.dto';
import { RemoveWorkoutExerciseDto } from './remove-workout-exercise.dto';
import { StartWorkoutDto } from './start-workout.dto';
import { UpdateWorkoutSetDto } from './update-workout-set.dto';

const sessionId = '123e4567-e89b-12d3-a456-426614174000';
const performanceId = '223e4567-e89b-12d3-a456-426614174000';
const setId = '323e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';

async function errors<T>(type: new () => T, input: unknown) {
  return validate(plainToInstance(type, input));
}

describe('workout-session command DTOs', () => {
  it('accepts and trims a freestyle or routine start', async () => {
    const dto = plainToInstance(StartWorkoutDto, {
      timezone: ' Asia/Qatar ',
      routineSlug: ' upper-a ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.timezone).toBe('Asia/Qatar');
    expect(dto.routineSlug).toBe('upper-a');
  });

  it('rejects invalid start metadata', async () => {
    const result = await errors(StartWorkoutDto, {
      timezone: 'Qatar/Not-A-Zone',
      routineSlug: 'Not A Slug',
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('validates UUID references for child and lifecycle commands', async () => {
    const valid = [
      [AddWorkoutExerciseDto, { exerciseId }],
      [RemoveWorkoutExerciseDto, { exercisePerformanceId: performanceId }],
      [DeleteWorkoutSetDto, { completedSetId: setId }],
      [CompleteWorkoutDto, {}],
      [CancelWorkoutDto, {}],
    ] as const;

    for (const [type, fields] of valid) {
      await expect(
        errors(type, { ...fields, workoutSessionId: sessionId }),
      ).resolves.toHaveLength(0);
      await expect(
        errors(type, { ...fields, workoutSessionId: 'not-a-uuid' }),
      ).resolves.toHaveLength(1);
    }
  });

  it('accepts valid recording and partial update payloads', async () => {
    await expect(
      errors(RecordWorkoutSetDto, {
        repetitions: 10,
        load: '100.25',
        loadUnit: 'KG',
        rir: 2,
        isWarmup: false,
      }),
    ).resolves.toHaveLength(0);
    await expect(
      errors(UpdateWorkoutSetDto, { repetitions: 9 }),
    ).resolves.toHaveLength(0);
  });

  it('rejects invalid repetitions, load, RIR, and unit values', async () => {
    const result = await errors(RecordWorkoutSetDto, {
      repetitions: -1,
      load: '-10',
      loadUnit: 'STONE',
      rir: 11,
    });
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('workout-session query DTOs', () => {
  it('transforms history pagination and date filters', async () => {
    const dto = plainToInstance(ListWorkoutHistoryQueryDto, {
      status: 'COMPLETED',
      from: '2026-08-01T00:00:00.000Z',
      to: '2026-08-31T23:59:59.000Z',
      limit: '20',
      offset: '10',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.limit).toBe(20);
    expect(dto.offset).toBe(10);
    expect(dto.from).toBeInstanceOf(Date);
    expect(dto.to).toBeInstanceOf(Date);
  });

  it('rejects invalid history status and pagination', async () => {
    const result = await errors(ListWorkoutHistoryQueryDto, {
      status: 'PLANNED',
      limit: 0,
      offset: -1,
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('validates exercise-history pagination and exercise identity', async () => {
    await expect(
      errors(GetExerciseHistoryQueryDto, { limit: 20, offset: 0 }),
    ).resolves.toHaveLength(0);
    await expect(
      errors(GetExerciseHistoryQueryDto, {
        limit: 20,
        offset: 0,
        exerciseId: 'not-a-uuid',
      }),
    ).resolves.toHaveLength(1);
  });
});
