import {
  ProgramWorkoutOccurrenceLifecycleError,
  ProgramWorkoutOccurrenceValidationError,
} from './errors/adopted-training-program.errors';
import {
  ProgramWorkoutOccurrence,
  type CreateProgramWorkoutOccurrenceAttributes,
} from './program-workout-occurrence.entity';

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
});
