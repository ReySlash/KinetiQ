jest.mock('../../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramSlugConflictError,
} from '../../../application/errors/training-program.errors';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { trainingProgramListSelect } from './prisma-training-program.mapper';
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
  const programFindMany = jest.fn();
  const routineFindMany =
    jest.fn<
      (query: RoutineQuery) => Promise<Array<{ id: string; slug: string }>>
    >();
  const create = jest.fn<(query: ProgramCreateQuery) => Promise<void>>();
  const transaction = jest.fn(
    async (work: (client: object) => Promise<unknown>) =>
      work({
        routine: { findMany: routineFindMany },
        trainingProgram: { create },
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
            trainingProgram: { findMany: programFindMany },
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
});
