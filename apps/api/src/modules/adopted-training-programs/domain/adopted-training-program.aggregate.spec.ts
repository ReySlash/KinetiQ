import { AdoptedTrainingProgram } from './adopted-training-program.aggregate';
import type { CreateAdoptedTrainingProgramAttributes } from './adopted-training-program.types';
import {
  AdoptedTrainingProgramLifecycleError,
  AdoptedTrainingProgramValidationError,
} from './errors/adopted-training-program.errors';

function occurrence(weekNumber: number, dayNumber: number) {
  return {
    weekNumber,
    dayNumber,
    routineNameSnapshot: `Routine ${weekNumber}-${dayNumber}`,
  };
}

function createProgram(
  overrides: Partial<CreateAdoptedTrainingProgramAttributes> = {},
) {
  return AdoptedTrainingProgram.create({
    ownerId: '11111111-1111-4111-8111-111111111111',
    programNameSnapshot: 'Beginner Strength',
    durationWeeksSnapshot: 2,
    startedAt: new Date('2026-01-01T10:00:00.000Z'),
    occurrences: [occurrence(2, 1), occurrence(1, 2), occurrence(1, 1)],
    ...overrides,
  });
}

describe('AdoptedTrainingProgram', () => {
  it('rejects invalid duration, empty schedules, out-of-range weeks, and duplicate slots', () => {
    expect(() => createProgram({ durationWeeksSnapshot: 0 })).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => createProgram({ occurrences: [] })).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => createProgram({ occurrences: [occurrence(3, 1)] })).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() =>
      createProgram({ occurrences: [occurrence(1, 1), occurrence(1, 1)] }),
    ).toThrow(AdoptedTrainingProgramValidationError);
  });

  it('orders occurrences and returns the first pending occurrence', () => {
    const program = createProgram();
    expect(program.occurrences.map((item) => item.slot.key)).toEqual([
      '1:1',
      '1:2',
      '2:1',
    ]);
    expect(program.nextPendingOccurrence()?.slot.key).toBe('1:1');
  });

  it('only starts or skips the next pending occurrence', () => {
    const program = createProgram();
    const laterOccurrenceId = program.occurrences[1].id.value;

    expect(() => program.startOccurrence(laterOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => program.skipOccurrence(laterOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
  });

  it('advances next-occurrence commands in schedule order', () => {
    const program = createProgram();
    const [first, second, third] = program.occurrences;

    const afterFirst = program.skipOccurrence(first.id.value);
    expect(afterFirst.nextPendingOccurrence()?.id.value).toBe(second.id.value);

    const withSecondInProgress = afterFirst.startOccurrence(second.id.value);
    expect(withSecondInProgress.nextPendingOccurrence()?.id.value).toBe(
      third.id.value,
    );
  });

  it('returns no next occurrence after every occurrence is resolved', () => {
    const program = createProgram();
    const [first, second, third] = program.occurrences;

    const resolved = program
      .skipOccurrence(first.id.value)
      .startOccurrence(second.id.value)
      .completeOccurrence(second.id.value)
      .skipOccurrence(third.id.value);

    expect(resolved.nextPendingOccurrence()).toBeNull();
  });

  it('enforces program lifecycle transitions and active-occurrence protection', () => {
    const active = createProgram();
    expect(active.pause().status).toBe('PAUSED');
    expect(active.pause().resume().status).toBe('ACTIVE');
    const withActiveOccurrence = active.startOccurrence(
      active.occurrences[0].id.value,
    );
    expect(() => withActiveOccurrence.pause()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => withActiveOccurrence.cancel()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => active.pause().complete()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
  });

  it('completes only after all occurrences are completed or skipped', () => {
    const active = createProgram();
    expect(() => active.complete()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );

    const inProgress = active.startOccurrence(active.occurrences[0].id.value);
    expect(() => inProgress.complete()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );

    const resolved = active
      .skipOccurrence(active.occurrences[0].id.value)
      .startOccurrence(active.occurrences[1].id.value)
      .completeOccurrence(active.occurrences[1].id.value)
      .skipOccurrence(active.occurrences[2].id.value);
    expect(resolved.complete().status).toBe('COMPLETED');
    expect(resolved.complete().completedAt).toBeInstanceOf(Date);
  });

  it('records mutually exclusive lifecycle timestamps', () => {
    const cancelled = createProgram().cancel();
    expect(cancelled.cancelledAt).toBeInstanceOf(Date);
    expect(cancelled.completedAt).toBeNull();
    expect(cancelled.cancelledAt?.getTime()).toBeGreaterThanOrEqual(
      cancelled.startedAt.getTime(),
    );

    const completed = createProgram();
    const [first, second, third] = completed.occurrences;
    const fullyResolved = completed
      .skipOccurrence(first.id.value)
      .startOccurrence(second.id.value)
      .completeOccurrence(second.id.value)
      .skipOccurrence(third.id.value)
      .complete();

    expect(fullyResolved.completedAt).toBeInstanceOf(Date);
    expect(fullyResolved.cancelledAt).toBeNull();
    expect(fullyResolved.completedAt?.getTime()).toBeGreaterThanOrEqual(
      fullyResolved.startedAt.getTime(),
    );
  });

  it('rejects every transition from terminal program states', () => {
    const resolved = createProgram();
    const terminal = resolved
      .skipOccurrence(resolved.occurrences[0].id.value)
      .skipOccurrence(resolved.occurrences[1].id.value)
      .skipOccurrence(resolved.occurrences[2].id.value)
      .complete();

    expect(() => terminal.pause()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => terminal.resume()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => terminal.cancel()).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
  });

  it('restricts occurrence commands by parent status', () => {
    const paused = createProgram().pause();
    const pausedOccurrenceId = paused.occurrences[0].id.value;
    expect(() => paused.startOccurrence(pausedOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => paused.skipOccurrence(pausedOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );

    const cancelled = createProgram().cancel();
    const cancelledOccurrenceId = cancelled.occurrences[0].id.value;
    expect(() => cancelled.startOccurrence(cancelledOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => cancelled.skipOccurrence(cancelledOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
  });

  it('revalidates persisted aggregate invariants and lifecycle timestamps', () => {
    const program = createProgram();
    const value = program.toValue();
    expect(() =>
      AdoptedTrainingProgram.reconstitute({ ...value, occurrences: [] }),
    ).toThrow(AdoptedTrainingProgramValidationError);
    expect(() =>
      AdoptedTrainingProgram.reconstitute({
        ...value,
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      }),
    ).toThrow(AdoptedTrainingProgramValidationError);

    expect(() =>
      AdoptedTrainingProgram.reconstitute({
        ...value,
        status: 'COMPLETED',
        completedAt: null,
      }),
    ).toThrow(AdoptedTrainingProgramValidationError);
    expect(() =>
      AdoptedTrainingProgram.reconstitute({
        ...value,
        status: 'CANCELLED',
        cancelledAt: null,
      }),
    ).toThrow(AdoptedTrainingProgramValidationError);
    expect(() =>
      AdoptedTrainingProgram.reconstitute({
        ...value,
        status: 'ACTIVE',
        completedAt: new Date('2026-01-02T10:00:00.000Z'),
      }),
    ).toThrow(AdoptedTrainingProgramValidationError);
    expect(() =>
      AdoptedTrainingProgram.reconstitute({
        ...value,
        status: 'CANCELLED',
        cancelledAt: new Date('2025-12-31T10:00:00.000Z'),
      }),
    ).toThrow(AdoptedTrainingProgramValidationError);
  });

  it('rejects occurrence commands for an occurrence outside the aggregate', () => {
    const program = createProgram();
    const foreignOccurrenceId = '22222222-2222-4222-8222-222222222222';

    expect(() => program.startOccurrence(foreignOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => program.skipOccurrence(foreignOccurrenceId)).toThrow(
      AdoptedTrainingProgramLifecycleError,
    );
    expect(() => program.completeOccurrence(foreignOccurrenceId)).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => program.cancelOccurrence(foreignOccurrenceId)).toThrow(
      AdoptedTrainingProgramValidationError,
    );
  });

  it('keeps occurrence collections immutable across state transitions', () => {
    const program = createProgram();
    expect(Object.isFrozen(program.occurrences)).toBe(true);

    const transitioned = program.skipOccurrence(
      program.occurrences[0].id.value,
    );
    expect(Object.isFrozen(transitioned.occurrences)).toBe(true);
  });
});
