import { WorkoutSessionValidationError } from '../errors/workout-session.errors';
import {
  CanonicalLoad,
  CompletedSetRepetitions,
  LoadUnit,
  RepetitionsInReserve,
} from './completed-set-performance.vo';
import { IanaTimezone } from './iana-timezone.vo';
import { PrescriptionSnapshot } from './prescription-snapshot.vo';
import { WorkoutOrder } from './workout-order.vo';
import { WorkoutSessionStatus } from './workout-session-status.vo';

describe('Workout session value objects', () => {
  describe('CanonicalLoad', () => {
    it('normalizes kilograms to Decimal(7,2) precision', () => {
      expect(CanonicalLoad.create('100.125', 'KG').value).toBe('100.13');
      expect(CanonicalLoad.create('0', 'KG').value).toBe('0.00');
    });

    it('converts pounds using exact decimal arithmetic', () => {
      expect(CanonicalLoad.create('225', 'LB').value).toBe('102.06');
      expect(CanonicalLoad.create('2.2046226218', 'LB').value).toBe('1.00');
    });

    it.each(['-1', 'NaN', '1e3', '', '100000', `1${'0'.repeat(30)}`])(
      'rejects load %p',
      (load) => {
        expect(() => CanonicalLoad.create(load, 'KG')).toThrow(
          WorkoutSessionValidationError,
        );
      },
    );
  });

  it('accepts only the approved display units', () => {
    expect(LoadUnit.create('KG').value).toBe('KG');
    expect(LoadUnit.create('LB').value).toBe('LB');
    expect(() => LoadUnit.create('STONE')).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('validates repetitions and RIR boundaries', () => {
    expect(CompletedSetRepetitions.create(0).value).toBe(0);
    expect(CompletedSetRepetitions.create(1000).value).toBe(1000);
    expect(RepetitionsInReserve.create(0).value).toBe(0);
    expect(RepetitionsInReserve.create(10).value).toBe(10);
    expect(() => CompletedSetRepetitions.create(-1)).toThrow(
      WorkoutSessionValidationError,
    );
    expect(() => CompletedSetRepetitions.create(1.5)).toThrow(
      WorkoutSessionValidationError,
    );
    expect(() => RepetitionsInReserve.create(11)).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('validates zero-based integer ordering', () => {
    expect(WorkoutOrder.create(0).value).toBe(0);
    expect(WorkoutOrder.create(1).value).toBe(1);
    expect(() => WorkoutOrder.create(-1)).toThrow(
      WorkoutSessionValidationError,
    );
    expect(() => WorkoutOrder.create(0.5)).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('validates IANA timezones and session statuses', () => {
    expect(IanaTimezone.create(' Asia/Qatar ').value).toBe('Asia/Qatar');
    expect(WorkoutSessionStatus.create('IN_PROGRESS').value).toBe(
      'IN_PROGRESS',
    );
    expect(() => IanaTimezone.create('Qatar/Not-A-Zone')).toThrow(
      WorkoutSessionValidationError,
    );
    expect(() => WorkoutSessionStatus.create('PLANNED')).toThrow(
      WorkoutSessionValidationError,
    );
  });

  it('normalizes and validates a complete prescription snapshot', () => {
    const snapshot = PrescriptionSnapshot.create({
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      targetRestSeconds: 120,
      targetTempo: ' 3-1-X-0 ',
      prescriptionNotes: ' Controlled reps ',
    });

    expect(snapshot.value).toEqual({
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 2,
      targetRestSeconds: 120,
      targetTempo: '3-1-X-0',
      prescriptionNotes: 'Controlled reps',
    });
  });

  it.each([
    { targetSetCount: 0, targetMinReps: 8, targetMaxReps: 10 },
    { targetSetCount: 3, targetMinReps: 11, targetMaxReps: 10 },
    {
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetRir: 11,
    },
    {
      targetSetCount: 3,
      targetMinReps: 8,
      targetMaxReps: 10,
      targetTempo: 'slow',
    },
  ])('rejects invalid prescription %p', (snapshot) => {
    expect(() => PrescriptionSnapshot.create(snapshot)).toThrow(
      WorkoutSessionValidationError,
    );
  });
});
