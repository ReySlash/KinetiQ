jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedPrincipal } from '../auth/principal';
import type { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { RoutinesService } from './routines.service';

const owner: AuthenticatedPrincipal = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  role: 'USER',
  sessionId: '223e4567-e89b-12d3-a456-426614174000',
};
const routineId = '323e4567-e89b-12d3-a456-426614174000';
const exerciseId = '423e4567-e89b-12d3-a456-426614174000';

function buildExercise() {
  return {
    exerciseId,
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
    ownerId: owner.userId,
    name,
    description: 'Pressing day',
    visibility: 'PRIVATE',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    exercises: [
      {
        id: '523e4567-e89b-12d3-a456-426614174000',
        exerciseId,
        order: 0,
        sets: 3,
        minReps: 8,
        maxReps: 12,
        targetRir: 2,
        restSeconds: 120,
        tempo: '3-1-X-0',
        notes: 'Controlled reps',
        exercise: {
          id: exerciseId,
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
          .mockResolvedValue([{ id: exerciseId, isActive: true }]),
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
      where: { id: { in: [exerciseId] } },
      select: { id: true, isActive: true },
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
    expect(result).toEqual({ message: 'Routine created successfully' });
  });

  it('scopes list rows to the authenticated owner with a single read', async () => {
    prismaMock.routine.findMany.mockResolvedValue([
      {
        id: routineId,
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

  it('conceals another owner’s routine as not found', async () => {
    prismaMock.routine.findFirst.mockResolvedValue(null);

    await expect(service.findOne(owner, routineId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.routine.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: routineId, ownerId: owner.userId },
      }),
    );
  });

  it('replaces children transactionally while preserving owner scope', async () => {
    transaction.routine.findFirst.mockResolvedValue({ id: routineId });

    await service.update(owner, routineId, {
      name: 'Updated',
      exercises: [buildExercise(), { ...buildExercise(), order: 99 }],
    });

    expect(transaction.routine.findFirst).toHaveBeenCalledWith({
      where: { id: routineId, ownerId: owner.userId },
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
        visibility: 'PRIVATE',
        exercises: [
          {
            exerciseId,
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

    await expect(service.duplicate(owner, routineId)).resolves.toEqual({
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
        exercises: {
          create: [
            {
              exerciseId,
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
  });

  it('deletes only an owned routine', async () => {
    prismaMock.routine.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.remove(owner, routineId)).resolves.toEqual({
      message: 'Routine deleted successfully',
    });
    expect(prismaMock.routine.deleteMany).toHaveBeenCalledWith({
      where: { id: routineId, ownerId: owner.userId },
    });
  });
});
