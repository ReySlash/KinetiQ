jest.mock(
  '../../../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { MuscleNotFoundError } from '../../application/errors/muscle.errors';
import type { MusclesCommandPort } from '../../application/ports/muscles-command.port';
import { Muscle } from '../../domain/entities/muscle.entity';
import { PrismaService } from '../../../modules/shared/infrastructure/database/prisma/prisma.service';
import { PrismaMusclesAdapter } from './prisma-muscles.adapter';

describe('PrismaMusclesAdapter', () => {
  type MuscleUpdateArgs = {
    where: { id: string };
    data: { name?: string };
  };

  let repository: PrismaMusclesAdapter;
  const create = jest.fn();
  const findUnique = jest.fn();
  const findFirst = jest.fn();
  const findMany = jest.fn();
  const update = jest.fn<Promise<unknown>, [MuscleUpdateArgs]>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaMusclesAdapter,
        {
          provide: PrismaService,
          useValue: {
            muscle: { create, findUnique, findFirst, findMany, update },
          },
        },
      ],
    }).compile();

    repository = module.get(PrismaMusclesAdapter);
    jest.clearAllMocks();
  });

  it('persists a domain-created muscle', async () => {
    const muscle = Muscle.create({
      name: 'biceps brachii',
      description: 'primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
    });

    await expect(repository.create(muscle)).resolves.toBeUndefined();
    expect(create).toHaveBeenCalledWith({ data: muscle.toValue() });
  });

  it('reconstitutes before applying update validation', async () => {
    findUnique.mockResolvedValue({
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Biceps brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      muscleGroupId: null,
      parentId: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date('2026-07-21T00:00:00.000Z'),
      updatedAt: new Date('2026-07-21T00:00:00.000Z'),
    });
    update.mockResolvedValue(undefined);

    await repository.updateBySlug('biceps-brachii', { name: '  Triceps  ' });

    const updateArgs = update.mock.calls[0]?.[0];
    expect(updateArgs.where.id).toBe('d8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1');
    expect(updateArgs.data.name).toBe('Triceps');
  });

  it('throws not found when updating an unknown slug', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      repository.updateBySlug('missing', { name: 'Triceps' }),
    ).rejects.toBeInstanceOf(MuscleNotFoundError);
    expect(update).not.toHaveBeenCalled();
  });

  it('throws not found when the muscle is deleted before the update', async () => {
    findUnique.mockResolvedValue({
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Biceps brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      muscleGroupId: null,
      parentId: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date('2026-07-21T00:00:00.000Z'),
      updatedAt: new Date('2026-07-21T00:00:00.000Z'),
    });
    const missingError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    missingError.code = 'P2025';
    update.mockRejectedValue(missingError);

    await expect(
      repository.updateBySlug('biceps-brachii', { name: 'Triceps' }),
    ).rejects.toBeInstanceOf(MuscleNotFoundError);
  });

  it('deactivates by id', async () => {
    update.mockResolvedValue(undefined);

    await expect(
      repository.deactivateById('muscle-id'),
    ).resolves.toBeUndefined();
    expect(update).toHaveBeenCalledWith({
      where: { id: 'muscle-id' },
      data: { isActive: false },
    });
  });

  it('implements the application command port', () => {
    const commandRepository: MusclesCommandPort = repository;
    expect(commandRepository).toBe(repository);
  });
});
