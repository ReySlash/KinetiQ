jest.mock(
  '../../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma/prisma.service';
import {
  TrainingProgramPersistenceError,
  TrainingProgramDeletePersistenceError,
  TrainingProgramNotFoundError,
  TrainingProgramQueryError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramScheduleConflictError,
  TrainingProgramSlugConflictError,
  TrainingProgramUpdateConflictError,
} from '../../../application/errors/training-program.errors';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import {
  trainingProgramDetailSelect,
  trainingProgramListSelect,
} from './prisma-training-program.mapper';
import { PrismaTrainingProgramsRepository } from './prisma-training-programs.repository';

describe('PrismaTrainingProgramsRepository', () => {
  type RoutineQuery = {
    where: {
      slug: { in: string[] };
      OR: Array<{ visibility: string; ownerId?: string }>;
    };
    select: { id: boolean; slug: boolean };
  };
  type ProgramCreateQuery = {
    data: {
      routines: {
        create: Array<{
          routineId: string;
          weekNumber: number;
          dayNumber: number;
        }>;
      };
    };
  };
  type ProgramUpdateQuery = {
    where: { id: string };
    data: {
      routines: {
        deleteMany: Record<string, never>;
        create: Array<{
          routineId: string;
          weekNumber: number;
          dayNumber: number;
        }>;
      };
    };
  };
  const programFindMany = jest.fn();
  const programFindFirst = jest.fn();
  const programDeleteMany = jest.fn();
  const routineFindMany = jest.fn<
    Promise<Array<{ id: string; slug: string }>>,
    [RoutineQuery]
  >();
  const create = jest.fn<Promise<void>, [ProgramCreateQuery]>();
  const update = jest.fn<Promise<void>, [ProgramUpdateQuery]>();
  const transaction = jest.fn(
    async (work: (client: object) => Promise<unknown>) =>
      work({
        routine: { findMany: routineFindMany },
        trainingProgram: { create, update },
      }),
  );
  let repository: PrismaTrainingProgramsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTrainingProgramsRepository,
        {
          provide: PrismaService,
          useValue: {
            trainingProgram: {
              findMany: programFindMany,
              findFirst: programFindFirst,
              deleteMany: programDeleteMany,
            },
            $transaction: transaction,
          },
        },
      ],
    }).compile();

    repository = module.get(PrismaTrainingProgramsRepository);
    jest.clearAllMocks();
  });

  it('creates a program and eligible schedule rows atomically', async () => {
    let capturedRoutineQuery: RoutineQuery | undefined;
    let capturedCreateQuery: ProgramCreateQuery | undefined;
    routineFindMany.mockImplementationOnce((query: RoutineQuery) => {
      capturedRoutineQuery = query;
      return Promise.resolve([{ id: 'routine-id', slug: 'upper-a' }]);
    });
    create.mockImplementationOnce((query: ProgramCreateQuery) => {
      capturedCreateQuery = query;
      return Promise.resolve();
    });

    await repository.create(
      TrainingProgram.create({
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Strength Base',
        description: null,
        durationWeeks: 4,
        schedule: [{ routineSlug: 'upper-a', weekNumber: 1, dayNumber: 1 }],
      }),
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(capturedRoutineQuery?.where.OR).toEqual([
      { visibility: 'GLOBAL' },
      {
        visibility: 'PRIVATE',
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
      },
    ]);
    expect(capturedCreateQuery?.data.routines.create[0]).toMatchObject({
      routineId: 'routine-id',
      weekNumber: 1,
      dayNumber: 1,
    });
  });

  it('conceals missing and inaccessible routines behind one error', async () => {
    routineFindMany.mockResolvedValue([]);

    await expect(
      repository.create(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
          schedule: [
            { routineSlug: 'private-routine', weekNumber: 1, dayNumber: 1 },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramRoutineUnavailableError);
    expect(create).not.toHaveBeenCalled();
  });

  it('selects only the approved list projection and applies scope', async () => {
    programFindMany.mockResolvedValue([]);

    await repository.findAll({
      scope: 'my',
      ownerId: 'owner-id',
      sort: 'updatedAt:desc',
      limit: 20,
      offset: 0,
    });

    expect(programFindMany).toHaveBeenCalledWith({
      where: { visibility: 'PRIVATE', ownerId: 'owner-id' },
      select: trainingProgramListSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
      take: 20,
      skip: 0,
    });
  });

  it('applies search, sorting, and pagination to the list projection', async () => {
    programFindMany.mockResolvedValue([]);

    await repository.findAll({
      scope: 'global',
      q: 'strength',
      sort: 'name:asc',
      limit: 10,
      offset: 20,
    });

    expect(programFindMany).toHaveBeenCalledWith({
      where: {
        visibility: 'GLOBAL',
        OR: [
          { name: { contains: 'strength', mode: 'insensitive' } },
          {
            description: {
              contains: 'strength',
              mode: 'insensitive',
            },
          },
        ],
      },
      select: trainingProgramListSelect,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 20,
    });
  });

  it('returns an ordered detail projection scoped by visibility and owner', async () => {
    programFindFirst.mockResolvedValue(null);

    await expect(
      repository.findBySlug({
        slug: 'strength-base-12345678',
        ownerId: 'owner-id',
      }),
    ).resolves.toBeNull();

    expect(programFindFirst).toHaveBeenCalledWith({
      where: {
        slug: 'strength-base-12345678',
        OR: [
          { visibility: 'GLOBAL' },
          { visibility: 'PRIVATE', ownerId: 'owner-id' },
        ],
      },
      select: trainingProgramDetailSelect,
    });
  });

  it('translates duplicate slug errors', async () => {
    const duplicateError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    duplicateError.code = 'P2002';
    create.mockRejectedValue(duplicateError);

    await expect(
      repository.create(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramSlugConflictError);
  });

  it('translates unexpected query errors', async () => {
    programFindMany.mockRejectedValue(new Error('database unavailable'));
    await expect(
      repository.findAll({
        scope: 'global',
        sort: 'updatedAt:desc',
        limit: 20,
        offset: 0,
      }),
    ).rejects.toBeInstanceOf(TrainingProgramQueryError);
  });

  it('translates unexpected persistence errors', async () => {
    create.mockRejectedValue(new Error('database unavailable'));
    await expect(
      repository.create(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramPersistenceError);
  });

  it('deletes only the owned private program', async () => {
    programDeleteMany.mockResolvedValue({ count: 1 });

    await expect(
      repository.deleteOwnedPrivateBySlug(
        'strength-base-12345678',
        '223e4567-e89b-12d3-a456-426614174000',
      ),
    ).resolves.toBeUndefined();

    expect(programDeleteMany).toHaveBeenCalledWith({
      where: {
        slug: 'strength-base-12345678',
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
        visibility: 'PRIVATE',
      },
    });
  });

  it('maps an ineligible or missing delete target to not found', async () => {
    programDeleteMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.deleteOwnedPrivateBySlug(
        'missing-program-12345678',
        '223e4567-e89b-12d3-a456-426614174000',
      ),
    ).rejects.toBeInstanceOf(TrainingProgramNotFoundError);
  });

  it('maps delete persistence failures to a stable error', async () => {
    programDeleteMany.mockRejectedValue(new Error('database unavailable'));

    await expect(
      repository.deleteOwnedPrivateBySlug(
        'strength-base-12345678',
        '223e4567-e89b-12d3-a456-426614174000',
      ),
    ).rejects.toBeInstanceOf(TrainingProgramDeletePersistenceError);
  });

  it('replaces the persisted schedule during update', async () => {
    let capturedUpdateQuery: ProgramUpdateQuery | undefined;
    routineFindMany.mockResolvedValue([{ id: 'routine-id', slug: 'upper-a' }]);
    update.mockImplementationOnce((query: ProgramUpdateQuery) => {
      capturedUpdateQuery = query;
      return Promise.resolve();
    });

    await repository.update(
      TrainingProgram.create({
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Strength Base',
        description: null,
        durationWeeks: 4,
        schedule: [{ routineSlug: 'upper-a', weekNumber: 2, dayNumber: 1 }],
      }),
    );

    expect(capturedUpdateQuery?.data.routines).toEqual({
      deleteMany: {},
      create: [
        expect.objectContaining({
          routineId: 'routine-id',
          weekNumber: 2,
          dayNumber: 1,
        }),
      ],
    });
  });

  it('clears all persisted schedule rows when update receives an empty schedule', async () => {
    let capturedUpdateQuery: ProgramUpdateQuery | undefined;
    update.mockImplementationOnce((query: ProgramUpdateQuery) => {
      capturedUpdateQuery = query;
      return Promise.resolve();
    });

    await repository.update(
      TrainingProgram.create({
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Strength Base',
        description: null,
        durationWeeks: 4,
        schedule: [],
      }),
    );

    expect(routineFindMany).not.toHaveBeenCalled();
    expect(capturedUpdateQuery?.data.routines).toEqual({
      deleteMany: {},
      create: [],
    });
  });

  it('does not persist an update when a scheduled routine is unavailable', async () => {
    routineFindMany.mockResolvedValue([]);

    await expect(
      repository.update(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
          schedule: [
            { routineSlug: 'missing-routine', weekNumber: 1, dayNumber: 1 },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramRoutineUnavailableError);
    expect(update).not.toHaveBeenCalled();
  });

  it('maps update persistence failures to a stable error', async () => {
    update.mockRejectedValue(new Error('database unavailable'));

    await expect(
      repository.update(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramPersistenceError);
  });

  it('maps a missing update target to not found', async () => {
    const missingError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    missingError.code = 'P2025';
    update.mockRejectedValue(missingError);

    await expect(
      repository.update(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramNotFoundError);
  });

  it('maps update unique constraint failures to conflict errors', async () => {
    const conflictError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    conflictError.code = 'P2002';
    conflictError.meta = { target: ['weekNumber', 'dayNumber'] };
    update.mockRejectedValue(conflictError);

    await expect(
      repository.update(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramScheduleConflictError);

    conflictError.meta = { target: ['slug'] };
    await expect(
      repository.update(
        TrainingProgram.create({
          ownerId: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Strength Base',
          description: null,
          durationWeeks: 4,
        }),
      ),
    ).rejects.toBeInstanceOf(TrainingProgramUpdateConflictError);
  });
});
