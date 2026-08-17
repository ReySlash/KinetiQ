jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { MuscleGroupQueryError } from '../../application/errors/muscle-group.errors';
import { PrismaMuscleGroupsAdapter } from './prisma-muscle-groups.adapter';
import {
  muscleGroupDetailSelect,
  muscleGroupListSelect,
} from './prisma-muscle-groups.mapper';

describe('PrismaMuscleGroupsAdapter', () => {
  const findMany = jest.fn();
  const findUnique = jest.fn();
  let adapter: PrismaMuscleGroupsAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaMuscleGroupsAdapter,
        {
          provide: PrismaService,
          useValue: {
            muscleGroup: { findMany, findUnique },
          },
        },
      ],
    }).compile();

    adapter = module.get(PrismaMuscleGroupsAdapter);
    jest.clearAllMocks();
  });

  it('returns the existing list projection and ordering', async () => {
    const rows = [
      {
        name: 'Upper body',
        slug: 'upper-body',
        description: 'Muscles of the upper body.',
        sortOrder: 0,
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [{ name: 'Biceps', bodyRegion: 'UPPER_BODY' as const }],
      },
    ];
    findMany.mockResolvedValue(rows);

    await expect(adapter.findAll()).resolves.toEqual(rows);
    expect(findMany).toHaveBeenCalledWith({
      select: muscleGroupListSelect,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  });

  it('returns the existing detail projection for a slug', async () => {
    const row = {
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Upper body',
      slug: 'upper-body',
      description: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      bodyRegion: 'UPPER_BODY' as const,
      muscles: [],
    };
    findUnique.mockResolvedValue(row);

    await expect(adapter.findBySlug('upper-body')).resolves.toEqual(row);
    expect(findUnique).toHaveBeenCalledWith({
      where: { slug: 'upper-body' },
      select: muscleGroupDetailSelect,
    });
  });

  it('returns null when a slug does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(adapter.findBySlug('missing')).resolves.toBeNull();
  });

  it('translates list persistence failures to a stable query error', async () => {
    findMany.mockRejectedValue(new Error('database unavailable'));

    await expect(adapter.findAll()).rejects.toBeInstanceOf(
      MuscleGroupQueryError,
    );
  });

  it('translates detail persistence failures to a stable query error', async () => {
    findUnique.mockRejectedValue(new Error('database unavailable'));

    await expect(adapter.findBySlug('upper-body')).rejects.toBeInstanceOf(
      MuscleGroupQueryError,
    );
  });
});
