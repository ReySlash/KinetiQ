import {
  AdoptedTrainingProgramValidationError,
  ProgramWorkoutOccurrenceValidationError,
} from '../errors/adopted-training-program.errors';
import { AdoptedProgramDuration } from './adopted-program-duration.vo';
import {
  AdoptedProgramNameSnapshot,
  ProgramSlotNotesSnapshot,
  RoutineNameSnapshot,
} from './adopted-program-snapshot.vo';
import { AdoptedTrainingProgramStatus } from './adopted-training-program-status.vo';
import { AdoptedProgramTimestamp } from './adopted-program-timestamp.vo';
import { ProgramWorkoutOccurrenceStatus } from './program-workout-occurrence-status.vo';
import { ProgramWorkoutSlot } from './program-workout-slot.vo';

describe('adopted training program value objects', () => {
  it('normalizes and validates program and routine snapshots', () => {
    expect(AdoptedProgramNameSnapshot.create('  Strength  ').value).toBe(
      'Strength',
    );
    expect(RoutineNameSnapshot.create('  Upper A  ').value).toBe('Upper A');
    expect(ProgramSlotNotesSnapshot.create('  Notes  ').value).toBe('Notes');
    expect(ProgramSlotNotesSnapshot.create('   ').value).toBeNull();
    expect(() => AdoptedProgramNameSnapshot.create('x')).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => RoutineNameSnapshot.create('')).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
    expect(() => ProgramSlotNotesSnapshot.create('x'.repeat(1001))).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
  });

  it('validates duration and slot boundaries', () => {
    expect(() => AdoptedProgramDuration.create(0)).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => AdoptedProgramDuration.create(1.5)).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => ProgramWorkoutSlot.create(0, 1)).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
    expect(() => ProgramWorkoutSlot.create(1, 0)).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
    expect(() => ProgramWorkoutSlot.create(1.5, 1)).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
  });

  it('accepts 52 weeks and rejects durations above the confirmed maximum', () => {
    // Failure mode: BC-04
    // Arrange
    const maximumDurationWeeks = 52;
    const aboveMaximumDurationWeeks = 53;

    // Act
    const maximumDuration = AdoptedProgramDuration.create(maximumDurationWeeks);
    const createAboveMaximum = () =>
      AdoptedProgramDuration.create(aboveMaximumDurationWeeks);

    // Assert
    expect(maximumDuration.value).toBe(maximumDurationWeeks);
    expect(createAboveMaximum).toThrow(AdoptedTrainingProgramValidationError);
  });

  it('accepts program day 364 and rejects days above that maximum', () => {
    // Failure mode: BC-04
    // Arrange
    const maximumProgramDay = 364;
    const aboveMaximumProgramDay = 365;

    // Act
    const maximumSlot = ProgramWorkoutSlot.create(52, maximumProgramDay);
    const createAboveMaximum = () =>
      ProgramWorkoutSlot.create(52, aboveMaximumProgramDay);

    // Assert
    expect(maximumSlot.dayNumber).toBe(maximumProgramDay);
    expect(createAboveMaximum).toThrow(ProgramWorkoutOccurrenceValidationError);
  });

  it('validates both status value objects', () => {
    expect(AdoptedTrainingProgramStatus.create('ACTIVE').value).toBe('ACTIVE');
    expect(ProgramWorkoutOccurrenceStatus.create('PENDING').value).toBe(
      'PENDING',
    );
    expect(() => AdoptedTrainingProgramStatus.create('UNKNOWN')).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    expect(() => ProgramWorkoutOccurrenceStatus.create('UNKNOWN')).toThrow(
      ProgramWorkoutOccurrenceValidationError,
    );
  });

  it('exposes validated readonly slot coordinates', () => {
    const slot = ProgramWorkoutSlot.create(1, 2);
    expect(slot.weekNumber).toBe(1);
    expect(slot.dayNumber).toBe(2);
    expect(slot.key).toBe('1:2');
  });

  it('validates timestamps and returns defensive date copies', () => {
    expect(() => AdoptedProgramTimestamp.create(new Date('invalid'))).toThrow(
      AdoptedTrainingProgramValidationError,
    );
    const timestamp = AdoptedProgramTimestamp.create(
      new Date('2026-01-01T00:00:00.000Z'),
    );
    const date = timestamp.toDate();
    date.setUTCFullYear(2030);
    expect(timestamp.toDate().getUTCFullYear()).toBe(2026);
  });
});
