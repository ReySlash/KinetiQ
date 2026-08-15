jest.mock(
  '../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import type { MuscleModel } from '../../generated/prisma/models/Muscle';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';
import { MusclesService } from './muscles.service';

describe('MusclesService', () => {
  let service: MusclesService;
  let create: jest.Mock<Promise<unknown>, [unknown]>;
  let findMany: jest.Mock<Promise<unknown>, [unknown]>;
  let findFirst: jest.Mock<Promise<unknown>, [unknown]>;
  let update: jest.Mock<Promise<unknown>, [unknown]>;

  type MuscleCreateArgs = {
    data: {
      id: string;
      name: string;
      slug: string;
      description: string;
      bodyRegion: string;
      muscleGroupId?: string;
      parentId?: string | null;
      sortOrder?: number;
    };
  };

  beforeEach(async () => {
    create = jest.fn<Promise<unknown>, [unknown]>();
    findMany = jest.fn<Promise<unknown>, [unknown]>();
    findFirst = jest.fn<Promise<unknown>, [unknown]>();
    update = jest.fn<Promise<unknown>, [unknown]>();
    const prismaServiceMock = {
      muscle: {
        create,
        findMany,
        findFirst,
        update,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusclesService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<MusclesService>(MusclesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a muscle with a normalized slug and Prisma-safe payload', async () => {
    const createdMuscle = {
      id: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
      name: 'Biceps Brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      muscleGroupId: 'd0c0e5fa-9f8d-4a34-8d0e-9f45ab7d2e12',
      parentId: null,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date('2026-07-21T00:00:00.000Z'),
      updatedAt: new Date('2026-07-21T00:00:00.000Z'),
    } satisfies MuscleModel;

    create.mockResolvedValue(createdMuscle);

    const result = await service.create({
      name: 'Biceps Brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      muscleGroupId: 'd0c0e5fa-9f8d-4a34-8d0e-9f45ab7d2e12',
      parentId: undefined,
      sortOrder: 3,
    });

    expect(create).toHaveBeenCalledTimes(1);
    const createArgs = create.mock.calls[0]?.[0] as MuscleCreateArgs;
    expect(createArgs.data.name).toBe('Biceps Brachii');
    expect(createArgs.data.slug).toBe('biceps-brachii');
    expect(createArgs.data.description).toBe(
      'Primary elbow flexor of the upper arm.',
    );
    expect(createArgs.data.bodyRegion).toBe('UPPER_BODY');
    expect(createArgs.data.muscleGroupId).toBe(
      'd0c0e5fa-9f8d-4a34-8d0e-9f45ab7d2e12',
    );
    expect(createArgs.data.sortOrder).toBe(3);
    expect(createArgs.data.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(result).toEqual({
      message: 'Muscle created successfully',
    });
  });

  it('maps a generated-slug duplicate back to the name field without extra lookups', async () => {
    create.mockRejectedValueOnce({
      code: 'P2002',
      meta: { target: ['slug'] },
    });

    try {
      await service.create({
        name: 'Biceps Brachii',
        description: 'Primary elbow flexor of the upper arm.',
        bodyRegion: 'UPPER_BODY',
      });
      fail('Expected duplicate name to be rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (error instanceof BadRequestException) {
        expect(error.getResponse()).toMatchObject({
          message: 'A muscle with that name already exists',
          field: 'name',
        });
      }
    }

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('maps duplicate slug errors without extra lookups', async () => {
    create.mockRejectedValueOnce({
      code: 'P2002',
      meta: { target: ['slug'] },
    });

    try {
      await service.create({
        name: 'Biceps Brachii',
        slug: 'existing-slug',
        description: 'Primary elbow flexor of the upper arm.',
        bodyRegion: 'UPPER_BODY',
      });
      fail('Expected duplicate slug to be rejected');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (error instanceof BadRequestException) {
        expect(error.getResponse()).toMatchObject({
          message: 'A muscle with that slug already exists',
          field: 'slug',
        });
      }
    }

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('returns a paginated, active-only list with a stable ordering', async () => {
    findMany.mockResolvedValue([]);

    const result = await service.findAll({
      limit: 10,
      offset: 20,
    });

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
        {
          createdAt: 'asc',
        },
        {
          id: 'asc',
        },
      ],
      take: 10,
      skip: 20,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bodyRegion: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        sortOrder: true,
      },
    });
    expect(result).toEqual([]);
  });

  it('returns an active muscle by slug', async () => {
    findFirst.mockResolvedValue({
      id: 'a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0',
      name: 'Biceps Brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      sortOrder: 1,
      exerciseMuscles: [
        {
          exercise: {
            name: 'Barbell Back Squat',
            slug: 'barbell-back-squat',
            thumbnailUrl: null,
            imageAltText: null,
          },
        },
      ],
      functionAssignments: [],
      muscleGroup: null,
    });

    await expect(service.findOne('biceps-brachii')).resolves.toEqual({
      id: 'a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0',
      name: 'Biceps Brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      sortOrder: 1,
      exerciseMuscles: [
        {
          name: 'Barbell Back Squat',
          slug: 'barbell-back-squat',
          thumbnailUrl: null,
          imageAltText: null,
        },
      ],
      functionAssignments: [],
      muscleGroup: null,
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'biceps-brachii',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        bodyRegion: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        sortOrder: true,
        exerciseMuscles: {
          select: {
            exercise: {
              select: {
                name: true,
                slug: true,
                thumbnailUrl: true,
                imageAltText: true,
              },
            },
          },
        },
        functionAssignments: {
          select: {
            role: true,
            muscleFunction: {
              select: {
                name: true,
                slug: true,
                description: true,
              },
            },
          },
        },
        muscleGroup: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  });

  it('throws NotFoundException when an active muscle does not exist', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a muscle with normalized name, description, and slug fields', async () => {
    update.mockResolvedValue({
      id: 'a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0',
      name: 'Biceps brachii',
      slug: 'existing-slug',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      sortOrder: 1,
    });

    await service.update('biceps-brachii', {
      name: 'biceps brachii',
      slug: 'existing slug',
      description: 'primary elbow flexor of the upper arm.',
    });

    expect(update).toHaveBeenCalledWith({
      where: {
        slug: 'biceps-brachii',
      },
      data: {
        name: 'Biceps brachii',
        slug: 'existing-slug',
        description: 'Primary elbow flexor of the upper arm.',
      },
    });
  });

  it('throws NotFoundException when update targets a missing muscle', async () => {
    const notFoundError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    notFoundError.code = 'P2025';

    update.mockRejectedValueOnce(notFoundError);

    await expect(
      service.update('missing-slug', {
        name: 'biceps brachii',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('soft-deletes a muscle by id', async () => {
    update.mockResolvedValue({
      id: 'a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0',
      name: 'Biceps Brachii',
      slug: 'biceps-brachii',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
      isActive: false,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      sortOrder: 1,
    });

    await expect(
      service.remove('a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0'),
    ).resolves.toBe('Resource soft-deleted successfully');

    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'a7bc0c6b-2f85-4c7d-9d6a-4b5af7d3f1f0',
      },
      data: {
        isActive: false,
      },
    });
  });

  it('throws NotFoundException when remove targets a missing muscle', async () => {
    const notFoundError = Object.create(
      PrismaClientKnownRequestError.prototype,
    ) as PrismaClientKnownRequestError;
    notFoundError.code = 'P2025';

    update.mockRejectedValueOnce(notFoundError);

    await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
