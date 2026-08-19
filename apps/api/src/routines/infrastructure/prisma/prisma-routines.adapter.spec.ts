jest.mock(
  '../../../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../modules/shared/infrastructure/database/prisma/prisma.service';
import {
  RoutineQueryError,
  RoutineNotFoundError,
} from '../../application/errors/routine.errors';
import { Routine } from '../../domain/entities/routine.entity';
import { routineFindAllSelect } from './prisma-routines.mapper';
import { PrismaRoutinesAdapter } from './prisma-routines.adapter';

describe('PrismaRoutinesAdapter', () => {
  const findMany = jest.fn();
  const findFirst = jest.fn();
  const findUnique = jest.fn();
  const create = jest.fn<Promise<unknown>, [unknown]>();
  const update = jest.fn();
  const deleteMany = jest.fn();
  const exerciseFindMany = jest.fn();
  const routineExerciseDeleteMany = jest.fn();
  const routineExerciseCreateMany = jest.fn();
  const transaction = jest.fn(
    async (work: (client: object) => Promise<unknown>) =>
      work({
        routine: { findUnique, create, update },
        exercise: { findMany: exerciseFindMany },
        routineExercise: {
          deleteMany: routineExerciseDeleteMany,
          createMany: routineExerciseCreateMany,
        },
      }),
  );
  let adapter: PrismaRoutinesAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRoutinesAdapter,
        {
          provide: PrismaService,
          useValue: {
            routine: {
              findMany,
              findFirst,
              findUnique,
              create,
              update,
              deleteMany,
            },
            $transaction: transaction,
          },
        },
      ],
    }).compile();

    adapter = module.get(PrismaRoutinesAdapter);
    jest.clearAllMocks();
  });

  it('uses the approved lightweight list projection', async () => {
    findMany.mockResolvedValue([]);

    await adapter.findAll({
      scope: 'global',
      sort: 'updatedAt:desc',
      limit: 20,
      offset: 0,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { visibility: 'GLOBAL' },
      select: routineFindAllSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: 20,
      skip: 0,
    });
  });

  it('translates list database failures to a query error', async () => {
    findMany.mockRejectedValue(new Error('database unavailable'));

    await expect(
      adapter.findAll({
        scope: 'global',
        sort: 'updatedAt:desc',
        limit: 20,
        offset: 0,
      }),
    ).rejects.toBeInstanceOf(RoutineQueryError);
  });

  it('creates a routine and validates referenced exercises in one transaction', async () => {
    exerciseFindMany.mockResolvedValue([
      { slug: 'bench-press', isActive: true },
    ]);
    create.mockResolvedValue({});
    const routine = Routine.create({
      ownerId: '223e4567-e89b-12d3-a456-426614174000',
      name: 'Upper A',
      exercises: [
        {
          exerciseSlug: 'bench-press',
          sets: 3,
          minReps: 8,
          maxReps: 10,
        },
      ],
    });

    await expect(adapter.create(routine)).resolves.toBeUndefined();
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]?.[0]).toBeDefined();
  });

  it('maps a missing scoped deletion to not found', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      adapter.deleteOwnedPrivateBySlug('missing', 'owner-id'),
    ).rejects.toBeInstanceOf(RoutineNotFoundError);
  });
});
