import { AdoptedTrainingProgram } from './adopted-training-program.aggregate';
import type {
  CreateAdoptedTrainingProgramAttributes,
  PrimitiveAdoptedTrainingProgram,
} from './adopted-training-program.types';
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

type AggregateTransition = (
  program: AdoptedTrainingProgram,
  occurrenceId: string,
) => AdoptedTrainingProgram;

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

  it('restores canonical order when reconstituting shuffled occurrences', () => {
    // Mutant: #275
    // Arrange
    const persisted = createProgram().toValue();
    const shuffledOccurrences = [...persisted.occurrences].reverse();

    // Act
    const reconstituted = AdoptedTrainingProgram.reconstitute({
      ...persisted,
      occurrences: shuffledOccurrences,
    });

    // Assert
    expect(reconstituted.occurrences.map((item) => item.slot.key)).toEqual([
      '1:1',
      '1:2',
      '2:1',
    ]);
    expect(reconstituted.nextPendingOccurrence()?.slot.key).toBe('1:1');
  });

  it.each([
    ['pause', (program) => program.pause()],
    ['resume', (program) => program.pause().resume()],
    ['cancel', (program) => program.cancel()],
    [
      'start occurrence',
      (program, occurrenceId) => program.startOccurrence(occurrenceId),
    ],
    [
      'cancel occurrence',
      (program, occurrenceId) =>
        program.startOccurrence(occurrenceId).cancelOccurrence(occurrenceId),
    ],
    [
      'complete occurrence',
      (program, occurrenceId) =>
        program.startOccurrence(occurrenceId).completeOccurrence(occurrenceId),
    ],
    [
      'skip occurrence',
      (program, occurrenceId) => program.skipOccurrence(occurrenceId),
    ],
  ] as [string, AggregateTransition][])(
    'retains source provenance after %s',
    (_label, transition) => {
      // Mutant: #257
      // Arrange
      const sourceTrainingProgramId = '33333333-3333-4333-8333-333333333333';
      const program = createProgram({ sourceTrainingProgramId });
      const occurrenceId = program.occurrences[0].id.value;

      // Act
      const transitioned = transition(program, occurrenceId);

      // Assert
      expect(transitioned.sourceTrainingProgramId).toBe(
        sourceTrainingProgramId,
      );
    },
  );

  it('rejects a reconstituted occurrence owned by another aggregate', () => {
    // Mutant: #341
    // Arrange
    const aggregateId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const otherAggregateId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const source = createProgram().toValue();
    const persisted = {
      ...source,
      id: aggregateId,
      occurrences: source.occurrences.map((occurrence, index) => {
        const ownedOccurrence = {
          ...occurrence,
          adoptedTrainingProgramId: aggregateId,
        };
        return index === 0
          ? { ...ownedOccurrence, adoptedTrainingProgramId: otherAggregateId }
          : ownedOccurrence;
      }),
    };

    // Act
    const reconstitute = () => AdoptedTrainingProgram.reconstitute(persisted);

    // Assert
    expect(reconstitute).toThrow(AdoptedTrainingProgramValidationError);
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

  it('automatically completes after every occurrence is resolved', () => {
    // Failure mode: BV-03
    // Arrange
    const program = createProgram();
    const [first, second, third] = program.occurrences;

    // Act
    const resolved = program
      .skipOccurrence(first.id.value)
      .startOccurrence(second.id.value)
      .completeOccurrence(second.id.value)
      .skipOccurrence(third.id.value);

    // Assert
    expect(resolved.nextPendingOccurrence()).toBeNull();
    expect(resolved.status).toBe('COMPLETED');
    expect(resolved.completedAt).toBeInstanceOf(Date);
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
  });

  it('allows cancellation from paused when no occurrence is active', () => {
    // Arrange
    const paused = createProgram().pause();

    // Act
    const cancelled = paused.cancel();

    // Assert
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancelledAt).toBeInstanceOf(Date);
  });

  it.each([
    ['skipped', 'skip'],
    ['completed', 'complete'],
  ] as const)(
    'completes the parent in the same operation when the final occurrence is %s',
    (_label, resolution) => {
      // Failure mode: BV-03
      // Arrange
      const program = createProgram({ occurrences: [occurrence(1, 1)] });
      const occurrenceId = program.occurrences[0].id.value;

      // Act
      const resolved =
        resolution === 'skip'
          ? program.skipOccurrence(occurrenceId)
          : program
              .startOccurrence(occurrenceId)
              .completeOccurrence(occurrenceId);

      // Assert
      expect(resolved.status).toBe('COMPLETED');
      expect(resolved.completedAt).toBeInstanceOf(Date);
    },
  );

  it('records mutually exclusive lifecycle timestamps', () => {
    // Failure mode: BV-03
    // Arrange
    const cancellable = createProgram();
    const completed = createProgram();
    const [first, second, third] = completed.occurrences;

    // Act
    const cancelled = cancellable.cancel();
    const fullyResolved = completed
      .skipOccurrence(first.id.value)
      .startOccurrence(second.id.value)
      .completeOccurrence(second.id.value)
      .skipOccurrence(third.id.value);

    // Assert
    expect(cancelled.cancelledAt).toBeInstanceOf(Date);
    expect(cancelled.completedAt).toBeNull();
    expect(cancelled.cancelledAt?.getTime()).toBeGreaterThanOrEqual(
      cancelled.startedAt.getTime(),
    );
    expect(fullyResolved.completedAt).toBeInstanceOf(Date);
    expect(fullyResolved.cancelledAt).toBeNull();
    expect(fullyResolved.completedAt?.getTime()).toBeGreaterThanOrEqual(
      fullyResolved.startedAt.getTime(),
    );
  });

  it('rejects every transition from terminal program states', () => {
    // Failure mode: BV-03
    // Arrange
    const resolved = createProgram();

    // Act
    const terminal = resolved
      .skipOccurrence(resolved.occurrences[0].id.value)
      .skipOccurrence(resolved.occurrences[1].id.value)
      .skipOccurrence(resolved.occurrences[2].id.value);

    // Assert
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

  it('rejects confirmed parent and child lifecycle contradictions during reconstitution', () => {
    // Failure mode: BV-02
    // Arrange
    const active = createProgram();
    const activeValue = active.toValue();
    const terminalTimestamp = new Date('2026-01-02T10:00:00.000Z');
    const reconstituteCompletedWithPendingOccurrence = () =>
      AdoptedTrainingProgram.reconstitute({
        ...activeValue,
        status: 'COMPLETED',
        completedAt: terminalTimestamp,
      });

    const withActiveOccurrence = active.startOccurrence(
      active.occurrences[0].id.value,
    );
    const reconstituteCancelledWithActiveOccurrence = () =>
      AdoptedTrainingProgram.reconstitute({
        ...withActiveOccurrence.toValue(),
        status: 'CANCELLED',
        cancelledAt: terminalTimestamp,
      });

    const completed = active
      .skipOccurrence(active.occurrences[0].id.value)
      .skipOccurrence(active.occurrences[1].id.value)
      .skipOccurrence(active.occurrences[2].id.value);
    const reconstituteActiveWithResolvedOccurrences = () =>
      AdoptedTrainingProgram.reconstitute({
        ...completed.toValue(),
        status: 'ACTIVE',
        completedAt: null,
      });

    // Act
    const actions = [
      reconstituteCompletedWithPendingOccurrence,
      reconstituteCancelledWithActiveOccurrence,
      reconstituteActiveWithResolvedOccurrences,
    ];

    // Assert
    for (const action of actions) {
      expect(action).toThrow(AdoptedTrainingProgramValidationError);
    }
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

  it.each([
    [
      'ACTIVE with no terminal timestamps',
      () => createProgram().toValue(),
      true,
    ],
    [
      'PAUSED with no terminal timestamps',
      () => createProgram().pause().toValue(),
      true,
    ],
    [
      'COMPLETED with only completedAt',
      () => {
        const completed = createProgram();
        return completed
          .skipOccurrence(completed.occurrences[0].id.value)
          .skipOccurrence(completed.occurrences[1].id.value)
          .skipOccurrence(completed.occurrences[2].id.value)
          .toValue();
      },
      true,
    ],
    [
      'CANCELLED with only cancelledAt',
      () => createProgram().cancel().toValue(),
      true,
    ],
    [
      'COMPLETED without completedAt',
      () => ({
        ...createProgram().toValue(),
        status: 'COMPLETED' as const,
        completedAt: null,
      }),
      false,
    ],
    [
      'COMPLETED with cancelledAt',
      () => {
        const completed = createProgram();
        const value = completed
          .skipOccurrence(completed.occurrences[0].id.value)
          .skipOccurrence(completed.occurrences[1].id.value)
          .skipOccurrence(completed.occurrences[2].id.value)
          .toValue();
        return {
          ...value,
          cancelledAt: new Date('2026-01-02T10:00:00.000Z'),
        };
      },
      false,
    ],
    [
      'CANCELLED without cancelledAt',
      () => ({
        ...createProgram().toValue(),
        status: 'CANCELLED' as const,
        cancelledAt: null,
      }),
      false,
    ],
    [
      'CANCELLED with completedAt',
      () => ({
        ...createProgram().cancel().toValue(),
        completedAt: new Date('2026-01-02T10:00:00.000Z'),
      }),
      false,
    ],
    [
      'ACTIVE with completedAt',
      () => ({
        ...createProgram().toValue(),
        completedAt: new Date('2026-01-02T10:00:00.000Z'),
      }),
      false,
    ],
    [
      'PAUSED with cancelledAt',
      () => ({
        ...createProgram().pause().toValue(),
        cancelledAt: new Date('2026-01-02T10:00:00.000Z'),
      }),
      false,
    ],
    [
      'COMPLETED before startedAt',
      () => {
        const completed = createProgram();
        const value = completed
          .skipOccurrence(completed.occurrences[0].id.value)
          .skipOccurrence(completed.occurrences[1].id.value)
          .skipOccurrence(completed.occurrences[2].id.value)
          .toValue();
        return {
          ...value,
          completedAt: new Date('2025-12-31T10:00:00.000Z'),
        };
      },
      false,
    ],
  ] as [string, () => PrimitiveAdoptedTrainingProgram, boolean][])(
    'enforces the lifecycle timestamp matrix for %s',
    (_label, createState, shouldReconstitute) => {
      // Mutants: #380, #386, #401, #410
      // Arrange
      const state = createState();

      // Act
      const reconstitute = () => AdoptedTrainingProgram.reconstitute(state);

      // Assert
      if (shouldReconstitute) {
        expect(reconstitute()).toBeInstanceOf(AdoptedTrainingProgram);
      } else {
        expect(reconstitute).toThrow(AdoptedTrainingProgramValidationError);
      }
    },
  );

  it('keeps occurrence collections immutable across state transitions', () => {
    const program = createProgram();
    expect(Object.isFrozen(program.occurrences)).toBe(true);

    const transitioned = program.skipOccurrence(
      program.occurrences[0].id.value,
    );
    expect(Object.isFrozen(transitioned.occurrences)).toBe(true);
  });
});
