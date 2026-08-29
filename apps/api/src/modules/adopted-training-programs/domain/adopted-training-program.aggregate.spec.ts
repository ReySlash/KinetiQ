import {
  AdoptedTrainingProgram,
  type CreateAdoptedTrainingProgramAttributes,
} from './adopted-training-program.aggregate';
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

  it('enforces program lifecycle transitions and active-occurrence protection', () => {
    const active = createProgram();
    expect(active.pause().status).toBe('PAUSED');
    expect(active.pause().resume().status).toBe('ACTIVE');
    const withActiveOccurrence = active.resolveOccurrence(
      active.occurrences[0].id.value,
      'IN_PROGRESS',
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

    const resolved = active
      .resolveOccurrence(active.occurrences[0].id.value, 'SKIPPED')
      .resolveOccurrence(active.occurrences[1].id.value, 'IN_PROGRESS')
      .resolveOccurrence(active.occurrences[1].id.value, 'COMPLETED')
      .resolveOccurrence(active.occurrences[2].id.value, 'SKIPPED');
    expect(resolved.complete().status).toBe('COMPLETED');
    expect(resolved.complete().completedAt).toBeInstanceOf(Date);
  });

  it('rejects every transition from terminal program states', () => {
    const resolved = createProgram();
    const terminal = resolved
      .resolveOccurrence(resolved.occurrences[0].id.value, 'SKIPPED')
      .resolveOccurrence(resolved.occurrences[1].id.value, 'SKIPPED')
      .resolveOccurrence(resolved.occurrences[2].id.value, 'SKIPPED')
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
});
