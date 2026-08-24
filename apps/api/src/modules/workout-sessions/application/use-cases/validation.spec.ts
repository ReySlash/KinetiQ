import { WorkoutSessionValidationError } from '../../domain/errors/workout-session.errors';
import {
  validateExerciseHistoryQuery,
  validateWorkoutHistoryQuery,
} from './validation';

const ownerId = '123e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';

describe('Workout session application query validation', () => {
  it('rejects invalid pagination', () => {
    expect(() =>
      validateWorkoutHistoryQuery({
        ownerId,
        limit: 0,
        offset: 0,
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('rejects reversed date ranges', () => {
    expect(() =>
      validateWorkoutHistoryQuery({
        ownerId,
        limit: 20,
        offset: 0,
        from: new Date('2026-08-25T00:00:00.000Z'),
        to: new Date('2026-08-24T00:00:00.000Z'),
      }),
    ).toThrow(WorkoutSessionValidationError);
  });

  it('validates both owner and exercise identity for exercise history', () => {
    expect(
      validateExerciseHistoryQuery({
        ownerId,
        exerciseId,
        limit: 20,
        offset: 0,
      }),
    ).toMatchObject({ ownerId, exerciseId });
  });
});
