jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { MuscleModel } from '../../generated/prisma/models/Muscle';
import { PrismaService } from '../prisma/prisma.service';
import { MusclesService } from './muscles.service';

type MuscleDelegate = InstanceType<typeof PrismaService>['muscle'];

describe('MusclesService', () => {
  let service: MusclesService;
  let create: jest.MockedFunction<MuscleDelegate['create']>;
  let findMany: jest.MockedFunction<MuscleDelegate['findMany']>;

  beforeEach(async () => {
    create = jest.fn();
    findMany = jest.fn();
    const prismaServiceMock = {
      muscle: {
        create,
        findMany,
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
    expect(create.mock.calls[0]?.[0].data.name).toBe('Biceps Brachii');
    expect(create.mock.calls[0]?.[0].data.slug).toBe('biceps-brachii');
    expect(create.mock.calls[0]?.[0].data.description).toBe(
      'Primary elbow flexor of the upper arm.',
    );
    expect(create.mock.calls[0]?.[0].data.bodyRegion).toBe('UPPER_BODY');
    expect(create.mock.calls[0]?.[0].data.muscleGroupId).toBe(
      'd0c0e5fa-9f8d-4a34-8d0e-9f45ab7d2e12',
    );
    expect(create.mock.calls[0]?.[0].data.sortOrder).toBe(3);
    expect(create.mock.calls[0]?.[0].data.id).toMatch(
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
});
