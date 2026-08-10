jest.mock('../../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramSlugConflictError,
} from '../../../application/errors/training-program.errors';
import { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { trainingProgramSelect } from './prisma-training-program.mapper';
import { PrismaTrainingProgramsRepository } from './prisma-training-programs.repository';

describe('PrismaTrainingProgramsRepository', () => {
  const findMany = jest.fn();
  const create = jest.fn();
  let repository: PrismaTrainingProgramsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTrainingProgramsRepository,
        {
          provide: PrismaService,
          useValue: { trainingProgram: { findMany, create } },
        },
      ],
    }).compile();

    repository = module.get(PrismaTrainingProgramsRepository);
    jest.clearAllMocks();
  });

  it('maps all persisted training programs to domain entities', async () => {
    findMany.mockResolvedValue([
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ownerId: '223e4567-e89b-12d3-a456-426614174000',
        slug: 'strength-base-123e4567',
        name: 'Strength Base',
        description: null,
        visibility: 'PRIVATE',
        durationWeeks: 4,
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        updatedAt: new Date('2026-08-02T00:00:00.000Z'),
      },
    ]);

    const result = await repository.findAll();

    expect(findMany).toHaveBeenCalledWith({
      select: trainingProgramSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });
    expect(result[0]).toBeInstanceOf(TrainingProgram);
    expect(result[0]).toMatchObject({ name: 'Strength Base' });
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
    findMany.mockRejectedValue(new Error('database unavailable'));

    await expect(repository.findAll()).rejects.toBeInstanceOf(
      TrainingProgramQueryError,
    );
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
