import { RoutineValidationError } from '../errors/routine.errors';
import {
  RoutineExerciseSlug,
  RoutineName,
  RoutineNotes,
  RoutineDescription,
} from './routine-text.vo';
import { RoutineSlug } from './routine-slug.vo';
import {
  RoutineReps,
  RoutineRestSeconds,
  RoutineSets,
  RoutineTargetRir,
  RoutineTempo,
} from './routine-prescription.vo';
import { RoutineVisibility } from './routine-visibility.vo';

describe('Routine value objects', () => {
  it('normalizes supported text values', () => {
    expect(RoutineName.create('  Upper Body  ').value).toBe('Upper Body');
    expect(RoutineDescription.create('  Pressing day  ').value).toBe(
      'Pressing day',
    );
    expect(RoutineExerciseSlug.create('  bench-press  ').value).toBe(
      'bench-press',
    );
    expect(RoutineNotes.create('  Controlled reps  ').value).toBe(
      'Controlled reps',
    );
  });

  it.each([
    ['name', () => RoutineName.create('a'.repeat(121))],
    ['description', () => RoutineDescription.create('a'.repeat(2001))],
    ['exercise slug', () => RoutineExerciseSlug.create('')],
    ['notes', () => RoutineNotes.create('a'.repeat(1001))],
  ])('rejects invalid %s text', (_label, create) => {
    expect(create).toThrow(RoutineValidationError);
  });

  it('creates the generated slug using the normalized name and UUID prefix', () => {
    expect(
      RoutineSlug.create(
        '  Upper Body A  ',
        '323e4567-e89b-12d3-a456-426614174000',
      ).value,
    ).toBe('upper-body-a-323e4567');
    expect(RoutineSlug.from('  upper-body-a-323e4567  ').value).toBe(
      'upper-body-a-323e4567',
    );
  });

  it.each([
    ['sets', () => RoutineSets.create(0)],
    ['minimum reps', () => RoutineReps.create(0, 'minimum')],
    ['maximum reps', () => RoutineReps.create(1001, 'maximum')],
    ['target RIR', () => RoutineTargetRir.create(11)],
    ['rest seconds', () => RoutineRestSeconds.create(3601)],
    ['tempo', () => RoutineTempo.create('3-1-X')],
  ])('rejects invalid %s values', (_label, create) => {
    expect(create).toThrow(RoutineValidationError);
  });

  it('normalizes valid tempo and validates visibility', () => {
    expect(RoutineTempo.create(' 3-1-X-0 ').value).toBe('3-1-X-0');
    expect(RoutineVisibility.create('PRIVATE').value).toBe('PRIVATE');
    expect(RoutineVisibility.create('GLOBAL').value).toBe('GLOBAL');
  });
});
