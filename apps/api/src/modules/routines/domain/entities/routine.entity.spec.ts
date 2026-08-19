import { RoutineValidationError } from '../errors/routine.errors';
import { Routine } from './routine.entity';

const ownerId = '123e4567-e89b-12d3-a456-426614174000';

const exercise = {
  exerciseSlug: '  bench-press  ',
  sets: 3,
  minReps: 8,
  maxReps: 12,
  targetRir: 2,
  restSeconds: 120,
  tempo: ' 3-1-X-0 ',
  notes: '  Controlled reps  ',
};

describe('Routine entity', () => {
  it('creates an empty routine for the incremental builder flow', () => {
    const routine = Routine.create({
      ownerId,
      name: '  Upper Body  ',
      description: '  Pressing day  ',
      exercises: [],
    });

    expect(routine.name).toBe('Upper Body');
    expect(routine.description).toBe('Pressing day');
    expect(routine.visibility).toBe('PRIVATE');
    expect(routine.exercises).toHaveLength(0);
    expect(routine.slug).toMatch(/^upper-body-[0-9a-f]{8}$/);
  });

  it('creates and orders prescriptions while trimming user-provided slugs', () => {
    const routine = Routine.create({
      ownerId,
      name: 'Upper Body',
      exercises: [exercise, { ...exercise, exerciseSlug: 'row' }],
    });

    expect(routine.exercises.map((item) => item.toValue())).toEqual([
      expect.objectContaining({
        exerciseSlug: 'bench-press',
        order: 0,
        tempo: '3-1-X-0',
        notes: 'Controlled reps',
      }),
      expect.objectContaining({ exerciseSlug: 'row', order: 1 }),
    ]);
  });

  it('rejects an invalid rep range', () => {
    expect(() =>
      Routine.create({
        ownerId,
        name: 'Upper Body',
        exercises: [{ ...exercise, minReps: 13, maxReps: 12 }],
      }),
    ).toThrow(RoutineValidationError);
  });

  it('updates fields and replaces prescriptions only when supplied', () => {
    const routine = Routine.create({
      ownerId,
      name: 'Upper Body',
      description: 'Pressing day',
      exercises: [exercise],
    });
    const renamed = routine.update({ name: 'Upper Body B' });
    expect(renamed.name).toBe('Upper Body B');
    expect(renamed.slug).toBe(routine.slug);
    expect(renamed.exercises).toHaveLength(1);

    const cleared = renamed.update({ exercises: [] });
    expect(cleared.exercises).toHaveLength(0);
    expect(cleared.description).toBe('Pressing day');
  });

  it('reconstitutes persisted values without changing identity or slug', () => {
    const created = Routine.create({
      ownerId,
      name: 'Upper Body',
      exercises: [],
    });
    const reconstituted = Routine.reconstitute(created.toValue());

    expect(reconstituted.id.value).toBe(created.id.value);
    expect(reconstituted.slug).toBe(created.slug);
    expect(reconstituted.equals(created)).toBe(true);
  });
});
