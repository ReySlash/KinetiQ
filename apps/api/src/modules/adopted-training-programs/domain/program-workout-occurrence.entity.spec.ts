import {
  ProgramWorkoutOccurrenceLifecycleError,
  ProgramWorkoutOccurrenceValidationError,
} from './errors/adopted-training-program.errors';
import { ProgramWorkoutOccurrence } from './program-workout-occurrence.entity';
import type { CreateProgramWorkoutOccurrenceAttributes } from './program-workout-occurrence.types';

const programId = '11111111-1111-4111-8111-111111111111';

function createOccurrence(
  overrides: Partial<CreateProgramWorkoutOccurrenceAttributes> = {},
) {
  return ProgramWorkoutOccurrence.create(programId, {
    weekNumber: 1,
    dayNumber: 1,
    routineNameSnapshot: 'Strength A',
    ...overrides,
  });
}

describe('ProgramWorkoutOccurrence', () => {
  it('validates slot and snapshot values', () => {
    expect(() => createOccurrence({ weekNumber: 0 })).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
    expect(() => createOccurrence({ routineNameSnapshot: ' ' })).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
  });

  it('supports the approved occurrence lifecycle', () => {
    const pending = createOccurrence();
    const inProgress = pending.start();
    const cancelled = inProgress.cancel();
    const completed = inProgress.complete();

    expect(inProgress.status).toBe('IN_PROGRESS');
    expect(cancelled.status).toBe('PENDING');
    expect(completed.status).toBe('COMPLETED');
    expect(() => pending.complete()).toThrow(
      ProgramWorkoutOccurrenceLifecycleError,
    );
  });

  it('allows skipping only pending occurrences and treats terminal states as immutable', () => {
    const skipped = createOccurrence().skip();
    expect(skipped.status).toBe('SKIPPED');
    expect(() => skipped.start()).toThrow(
      ProgramWorkoutOccurrenceLifecycleError,
    );
    expect(() => createOccurrence().start().skip()).toThrow(
      ProgramWorkoutOccurrenceLifecycleError,
    );
  });

  it('reconstitutes only valid audit timestamps and source identifiers', () => {
    const occurrence = createOccurrence({
      sourceRoutineId: '22222222-2222-4222-8222-222222222222',
    });
    const value = occurrence.toValue();
    expect(() =>
      ProgramWorkoutOccurrence.reconstitute({
        ...value,
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      }),
    ).toThrow(ProgramWorkoutOccurrenceValidationError);
    expect(() =>
      ProgramWorkoutOccurrence.reconstitute({
        ...value,
        sourceRoutineId: 'not-a-uuid',
      }),
    ).toThrow(ProgramWorkoutOccurrenceValidationError);
  });

  it('returns defensive timestamp copies and advances updatedAt on transitions', () => {
    const occurrence = createOccurrence();
    const createdAt = occurrence.createdAt;
    createdAt.setFullYear(2030);

    expect(occurrence.createdAt.getFullYear()).toBe(2026);

    const started = occurrence.start();
    expect(started.updatedAt.getTime()).toBeGreaterThanOrEqual(
      started.createdAt.getTime(),
    );
    expect(started.updatedAt).not.toBe(occurrence.updatedAt);
  });

  it('validates both optional source identifiers during creation and reconstitution', () => {
    expect(() =>
      createOccurrence({
        sourceTrainingProgramRoutineId: 'not-a-uuid',
      }),
    ).toThrow(ProgramWorkoutOccurrenceValidationError);

    const occurrence = createOccurrence({
      sourceTrainingProgramRoutineId: '22222222-2222-4222-8222-222222222222',
      sourceRoutineId: '33333333-3333-4333-8333-333333333333',
    });
    expect(occurrence.sourceTrainingProgramRoutineId).toBe(
      '22222222-2222-4222-8222-222222222222',
    );
    expect(occurrence.sourceRoutineId).toBe(
      '33333333-3333-4333-8333-333333333333',
    );
  });

  it.each([
    ['sourceRoutineId', ''],
    ['sourceRoutineId', '   '],
    ['sourceTrainingProgramRoutineId', ''],
    ['sourceTrainingProgramRoutineId', '   '],
  ] as const)('rejects a blank %s when it is present', (field, value) => {
    // Failure mode: NE-03
    // Arrange
    const attributes = { [field]: value };

    // Act
    const createWithBlankProvenance = () => createOccurrence(attributes);

    // Assert
    expect(createWithBlankProvenance).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
  });
});
