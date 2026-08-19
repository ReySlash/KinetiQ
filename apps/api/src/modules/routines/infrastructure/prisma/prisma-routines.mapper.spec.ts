import { Routine } from '../../domain/entities/routine.entity';
import type { CreateRoutineAttributes } from '../../domain/entities/routine.types';
import {
  buildRoutinesFindAllQuery,
  toCreateData,
  toExerciseCreateData,
  toUpdateData,
} from './prisma-routines.mapper';

const input: CreateRoutineAttributes = {
  ownerId: '223e4567-e89b-12d3-a456-426614174000',
  name: 'Upper A',
  description: '  Pressing day  ',
  visibility: 'PRIVATE',
  exercises: [
    {
      exerciseSlug: '  bench-press ',
      sets: 3,
      minReps: 8,
      maxReps: 10,
      targetRir: 2,
      restSeconds: 120,
      tempo: '  3-1-1-0 ',
      notes: '  Controlled  ',
    },
  ],
};

describe('prisma routines mapper', () => {
  it('builds scoped, searchable, paginated list queries', () => {
    expect(
      buildRoutinesFindAllQuery({
        scope: 'my',
        ownerId: input.ownerId,
        q: '  press ',
        sort: 'name:desc',
        limit: 10,
        offset: 20,
      }),
    ).toMatchObject({
      where: {
        ownerId: input.ownerId,
        OR: [
          { name: { contains: 'press', mode: 'insensitive' } },
          { description: { contains: 'press', mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'desc' }, { id: 'asc' }],
      take: 10,
      skip: 20,
    });
  });

  it('maps scalar routine data and nested exercise rows separately', () => {
    const routine = Routine.create(input);
    const scalar = toCreateData(routine);

    expect(scalar).toMatchObject({
      id: routine.id.value,
      ownerId: input.ownerId,
      name: 'Upper A',
      description: 'Pressing day',
      visibility: 'PRIVATE',
    });
    expect(scalar).not.toHaveProperty('exercises');
    expect(toExerciseCreateData(routine)).toEqual([
      expect.objectContaining({ exerciseSlug: 'bench-press', order: 0 }),
    ]);
  });

  it('maps only mutable scalar fields for updates', () => {
    const data = toUpdateData(Routine.create(input));

    expect(data).toEqual({ name: 'Upper A', description: 'Pressing day' });
    expect(data).not.toHaveProperty('slug');
    expect(data).not.toHaveProperty('ownerId');
    expect(data).not.toHaveProperty('exercises');
  });
});
