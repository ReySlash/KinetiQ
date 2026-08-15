jest.mock(
  '../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';
import type { AuthenticatedPrincipal } from '../modules/shared/infrastructure/auth/principal';
import type { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { RoutinesService } from './routines.service';

const owner: AuthenticatedPrincipal = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  role: 'USER',
  sessionId: '223e4567-e89b-12d3-a456-426614174000',
};
const routineId = '323e4567-e89b-12d3-a456-426614174000';
const routineSlug = 'upper-body-323e4567';
const exerciseSlug = 'bench-press';

function buildExercise() {
  return {
    exerciseSlug,
    sets: 3,
    minReps: 8,
    maxReps: 12,
    targetRir: 2,
    restSeconds: 120,
    tempo: '3-1-X-0',
    notes: 'Controlled reps',
  };
}

function buildDto(): CreateRoutineDto {
  return {
    name: '  Upper Body  ',
    description: '  Pressing day  ',
    exercises: [buildExercise()],
  };
}

function buildRoutineRow(name = 'Upper Body') {
  return {
    id: routineId,
    slug: routineSlug,
    ownerId: owner.userId,
    name,
    description: 'Pressing day',
    visibility: 'PRIVATE',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    exercises: [
      {
        id: '523e4567-e89b-12d3-a456-426614174000',
        exerciseSlug,
        order: 0,
        sets: 3,
        minReps: 8,
        maxReps: 12,
        targetRir: 2,
        restSeconds: 120,
        tempo: '3-1-X-0',
        notes: 'Controlled reps',
        exercise: {
          name: 'Bench Press',
          slug: 'bench-press',
          isActive: true,
          archivedAt: null,
        },
      },
    ],
  };
}

describe('RoutinesService', () => {
  let service: RoutinesService;
  let prismaMock: {
    $transaction: jest.Mock;
    routine: Record<string, jest.Mock>;
    routineExercise: Record<string, jest.Mock>;
    exercise: Record<string, jest.Mock>;
  };
  let transaction: {
    routine: Record<string, jest.Mock>;
    routineExercise: Record<string, jest.Mock>;
    exercise: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    transaction = {
      routine: {
        create: jest.fn().mockResolvedValue(buildRoutineRow()),
        findFirst: jest.fn(),
        findFirstOrThrow: jest.fn().mockResolvedValue(buildRoutineRow()),
        update: jest.fn(),
      },
      routineExercise: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      exercise: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ slug: exerciseSlug, isActive: true }]),
      },
    };

    prismaMock = {
      $transaction: jest.fn(
        (callback: (client: typeof transaction) => unknown) =>
          Promise.resolve(callback(transaction)),
      ),
      routine: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
      },
      routineExercise: {},
      exercise: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutinesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RoutinesService>(RoutinesService);
  });

  it('creates an owner-scoped aggregate and normalizes its strings', async () => {
    const result = await service.create(owner, buildDto());
    expect(transaction.exercise.findMany).toHaveBeenCalledWith({
      where: { slug: { in: [exerciseSlug] } },
      select: { slug: true, isActive: true },
    });
    const createArgs = (
      transaction.routine.create as jest.Mock<unknown, [unknown]>
    ).mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
    };
    expect(createArgs).toMatchObject({
      data: {
        ownerId: owner.userId,
        name: 'Upper Body',
        description: 'Pressing day',
      },
    });
    expect(createArgs.data.slug).toEqual(
      expect.stringMatching(/^upper-body-[0-9a-f]{8}$/),
    );
    expect(result).toEqual({ message: 'Routine created successfully' });
  });

  it('scopes list rows to the authenticated owner with a single read', async () => {
    prismaMock.routine.findMany.mockResolvedValue([
      {
        id: routineId,
        slug: routineSlug,
        name: 'Upper Body',
        description: 'Pressing day',
        visibility: 'PRIVATE',
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        updatedAt: new Date('2026-08-01T00:00:00.000Z'),
        _count: { exercises: 1 },
      },
    ]);
    const query = Object.assign(new FindRoutinesQueryDto(), {
      q: 'upper',
      sort: 'name:asc',
      limit: 10,
      offset: 10,
      scope: 'my' as const,
    });

    const result = await service.findAll(owner, query);

    expect(prismaMock.routine.count).not.toHaveBeenCalled();
    expect(prismaMock.routine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId: owner.userId,
          OR: [
            { name: { contains: 'upper', mode: 'insensitive' } },
            { description: { contains: 'upper', mode: 'insensitive' } },
          ],
        },
        skip: 10,
        take: 10,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(result).toEqual([
      expect.objectContaining({ name: 'Upper Body', exerciseCount: 1 }),
    ]);
  });

  it('lists global routines without an authenticated principal', async () => {
    prismaMock.routine.findMany.mockResolvedValue([]);
    const query = Object.assign(new FindRoutinesQueryDto(), {
      scope: 'global' as const,
    });

    await expect(service.findAll(null, query)).resolves.toEqual([]);
    expect(prismaMock.routine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { visibility: 'GLOBAL' } }),
    );
  });

  it('requires authentication for the my-routines scope', async () => {
    await expect(
      service.findAll(null, new FindRoutinesQueryDto()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('conceals another owner’s routine as not found', async () => {
    prismaMock.routine.findFirst.mockResolvedValue(null);

    await expect(service.findOne(owner, routineSlug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.routine.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: routineSlug,
          OR: [{ visibility: 'GLOBAL' }, { ownerId: owner.userId }],
        },
      }),
    );
  });

  it('allows anonymous reads of global routines', async () => {
    prismaMock.routine.findFirst.mockResolvedValue({
      ...buildRoutineRow('Push'),
      slug: 'push',
      visibility: 'GLOBAL',
    });

    await expect(service.findOne(null, 'push')).resolves.toMatchObject({
      slug: 'push',
      visibility: 'GLOBAL',
    });
    expect(prismaMock.routine.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'push', visibility: 'GLOBAL' },
      }),
    );
  });

  it('replaces children transactionally while preserving owner scope', async () => {
    transaction.routine.findFirst.mockResolvedValue({ id: routineId });

    await service.update(owner, routineSlug, {
      name: 'Updated',
      exercises: [buildExercise(), { ...buildExercise(), order: 99 }],
    });

    expect(transaction.routine.findFirst).toHaveBeenCalledWith({
      where: {
        slug: routineSlug,
        ownerId: owner.userId,
        visibility: 'PRIVATE',
      },
      select: { id: true },
    });
    expect(transaction.routineExercise.deleteMany).toHaveBeenCalledWith({
      where: { routineId },
    });
    expect(transaction.routineExercise.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ routineId, order: 0 }),
        expect.objectContaining({ routineId, order: 1 }),
      ],
    });
  });

  it('duplicates an owned routine with a new aggregate and copy name', async () => {
    transaction.routine.create.mockResolvedValueOnce(
      buildRoutineRow('Upper Body (Copy)'),
    );
    transaction.routine.findFirst
      .mockResolvedValueOnce({
        name: 'Upper Body',
        description: 'Pressing day',
        exercises: [
          {
            exerciseSlug,
            order: 0,
            sets: 3,
            minReps: 8,
            maxReps: 12,
            targetRir: 2,
            restSeconds: 120,
            tempo: '3-1-X-0',
            notes: 'Controlled reps',
          },
        ],
      })
      .mockResolvedValueOnce(null);

    await expect(service.duplicate(owner, routineSlug)).resolves.toEqual({
      message: 'Routine duplicated successfully',
    });

    const duplicateArgs = (
      transaction.routine.create as jest.Mock<unknown, [unknown]>
    ).mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
    };
    expect(duplicateArgs).toMatchObject({
      data: {
        ownerId: owner.userId,
        name: 'Upper Body (Copy)',
        visibility: 'PRIVATE',
        exercises: {
          create: [
            {
              exerciseSlug,
              order: 0,
              sets: 3,
              minReps: 8,
              maxReps: 12,
              targetRir: 2,
              restSeconds: 120,
              tempo: '3-1-X-0',
              notes: 'Controlled reps',
            },
          ],
        },
      },
    });
    expect(duplicateArgs.data.slug).toEqual(
      expect.stringMatching(/^upper-body-copy-[0-9a-f]{8}$/),
    );
  });

  it('copies a global routine into a private owned routine', async () => {
    transaction.routine.findFirst
      .mockResolvedValueOnce({
        name: 'Push',
        description: 'Global push routine',
        exercises: [{ ...buildExercise(), order: 0 }],
      })
      .mockResolvedValueOnce(null);

    await service.duplicate(owner, 'push');

    expect(transaction.routine.findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: {
          slug: 'push',
          OR: [
            { visibility: 'GLOBAL' },
            { ownerId: owner.userId, visibility: 'PRIVATE' },
          ],
        },
      }),
    );
    const copiedRoutineArgs = (
      transaction.routine.create as jest.Mock<unknown, [unknown]>
    ).mock.calls[0]?.[0] as { data: Record<string, unknown> };
    expect(copiedRoutineArgs.data).toMatchObject({
      ownerId: owner.userId,
      visibility: 'PRIVATE',
    });
  });

  it('deletes only an owned routine', async () => {
    prismaMock.routine.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.remove(owner, routineSlug)).resolves.toEqual({
      message: 'Routine deleted successfully',
    });
    expect(prismaMock.routine.deleteMany).toHaveBeenCalledWith({
      where: {
        slug: routineSlug,
        ownerId: owner.userId,
        visibility: 'PRIVATE',
      },
    });
  });
});
