jest.mock(
  '../../../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, type TestingModule } from '@nestjs/testing';
import type { ExercisesCommandPort } from '../../application/ports/exercises-command.port';
import type { ExercisesQueriesPort } from '../../application/ports/exercises-queries.port';
import { PrismaService } from '../../../modules/shared/infrastructure/database/prisma/prisma.service';
import { PrismaExercisesAdapter } from './prisma-exercises.adapter';

describe('PrismaExercisesAdapter', () => {
  let adapter: PrismaExercisesAdapter;
  const findMany = jest.fn();
  const findFirst = jest.fn();
  const findUnique = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaExercisesAdapter,
        {
          provide: PrismaService,
          useValue: {
            exercise: { findMany, findFirst, findUnique },
          },
        },
      ],
    }).compile();

    adapter = module.get(PrismaExercisesAdapter);
    jest.clearAllMocks();
  });

  it('implements both application ports', () => {
    const commandPort: ExercisesCommandPort = adapter;
    const queriesPort: ExercisesQueriesPort = adapter;

    expect(commandPort).toBe(adapter);
    expect(queriesPort).toBe(adapter);
  });

  it('delegates the active exercise list query to Prisma', async () => {
    findMany.mockResolvedValue([]);

    await expect(
      adapter.findAll({ search: 'squat', limit: 10, offset: 5 }),
    ).resolves.toEqual([]);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 5,
      }),
    );
  });

  it('returns null when an active exercise cannot be found by slug', async () => {
    findFirst.mockResolvedValue(null);

    await expect(adapter.findBySlug('missing-exercise')).resolves.toBeNull();
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'missing-exercise', isActive: true },
      }),
    );
  });

  it('returns null when an exercise id does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(adapter.findById('missing-id')).resolves.toBeNull();
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing-id' } }),
    );
  });
});
