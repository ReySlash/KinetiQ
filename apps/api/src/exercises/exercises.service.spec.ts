jest.mock(
  '../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';
import { ExercisesService } from './exercises.service';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let findMany: jest.Mock<Promise<unknown>, [unknown]>;
  let findFirst: jest.Mock<Promise<unknown>, [unknown]>;
  let update: jest.Mock<Promise<unknown>, [unknown]>;

  beforeEach(async () => {
    findMany = jest.fn<Promise<unknown>, [unknown]>();
    findFirst = jest.fn<Promise<unknown>, [unknown]>();
    update = jest.fn<Promise<unknown>, [unknown]>();

    const prismaServiceMock = {
      exercise: {
        findMany,
        findFirst,
        update,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns active exercises with a stable ordering and pagination', async () => {
    findMany.mockResolvedValue([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [
          {
            muscle: {
              name: 'Quadriceps',
              slug: 'quadriceps',
            },
          },
          {
            muscle: {
              name: 'Glutes',
              slug: 'glutes',
            },
          },
        ],
      },
    ]);

    await expect(
      service.findAll({
        limit: 12,
        offset: 24,
      }),
    ).resolves.toEqual([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [
          {
            name: 'Quadriceps',
            slug: 'quadriceps',
          },
          {
            name: 'Glutes',
            slug: 'glutes',
          },
        ],
      },
    ]);

    expect(findMany).toHaveBeenCalledWith({
      take: 12,
      skip: 24,
      select: {
        name: true,
        slug: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        muscles: {
          select: {
            muscle: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('searches exercises by exercise and muscle names and slugs', async () => {
    findMany.mockResolvedValue([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [],
      },
    ]);

    await expect(
      service.findAll({
        limit: 10,
        offset: 0,
        search: 'quad',
      }),
    ).resolves.toEqual([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [],
      },
    ]);

    expect(findMany).toHaveBeenCalledWith({
      take: 10,
      skip: 0,
      select: {
        name: true,
        slug: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        muscles: {
          select: {
            muscle: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: 'quad',
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: 'quad',
              mode: 'insensitive',
            },
          },
          {
            muscles: {
              some: {
                muscle: {
                  OR: [
                    {
                      name: {
                        contains: 'quad',
                        mode: 'insensitive',
                      },
                    },
                    {
                      slug: {
                        contains: 'quad',
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('filters exercises by force type, laterality, and skill level', async () => {
    findMany.mockResolvedValue([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [],
      },
    ]);

    await expect(
      service.findAll({
        limit: 8,
        offset: 16,
        search: 'press',
        forceType: 'PUSH',
        laterality: 'BILATERAL',
        skillLevel: 'INTERMEDIATE',
      }),
    ).resolves.toEqual([
      {
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        thumbnailUrl: null,
        thumbnailStorageKey: null,
        imageAltText: null,
        muscles: [],
      },
    ]);

    expect(findMany).toHaveBeenCalledWith({
      take: 8,
      skip: 16,
      select: {
        name: true,
        slug: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        muscles: {
          select: {
            muscle: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      where: {
        isActive: true,
        forceType: 'PUSH',
        laterality: 'BILATERAL',
        skillLevel: 'INTERMEDIATE',
        OR: [
          {
            name: {
              contains: 'press',
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: 'press',
              mode: 'insensitive',
            },
          },
          {
            muscles: {
              some: {
                muscle: {
                  OR: [
                    {
                      name: {
                        contains: 'press',
                        mode: 'insensitive',
                      },
                    },
                    {
                      slug: {
                        contains: 'press',
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });
  });

  it('returns an active exercise by slug with flattened equipment details', async () => {
    findFirst.mockResolvedValue({
      id: 'exercise-1',
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description: 'A foundational lower body compound exercise.',
      instructions: 'Descend under control and drive through the midfoot.',
      commonMistakes: null,
      forceType: 'PUSH',
      kineticChain: 'CLOSED',
      isCompound: true,
      laterality: 'BILATERAL',
      contractionMode: 'DYNAMIC',
      bodyPosition: 'STANDING',
      skillLevel: 'INTERMEDIATE',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      movementPattern: {
        name: 'Squat',
        slug: 'squat',
        description: 'Knee-dominant lower body pattern',
      },
      capabilities: null,
      demands: null,
      equipment: [
        {
          equipment: {
            name: 'Barbell',
            slug: 'barbell',
            description: 'A straight loaded bar used for resistance training.',
          },
        },
        {
          equipment: {
            name: 'Rack',
            slug: 'rack',
            description: 'A stable rack for barbell work.',
          },
        },
      ],
      muscles: [
        {
          muscle: {
            name: 'Quadriceps',
            slug: 'quadriceps',
            thumbnailUrl: null,
            imageAltText: null,
          },
        },
        {
          muscle: {
            name: 'Glutes',
            slug: 'glutes',
            thumbnailUrl: null,
            imageAltText: null,
          },
        },
      ],
    });

    await expect(service.findOne('barbell-back-squat')).resolves.toEqual({
      id: 'exercise-1',
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description: 'A foundational lower body compound exercise.',
      instructions: 'Descend under control and drive through the midfoot.',
      commonMistakes: null,
      forceType: 'PUSH',
      kineticChain: 'CLOSED',
      isCompound: true,
      laterality: 'BILATERAL',
      contractionMode: 'DYNAMIC',
      bodyPosition: 'STANDING',
      skillLevel: 'INTERMEDIATE',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      movementPattern: {
        name: 'Squat',
        slug: 'squat',
        description: 'Knee-dominant lower body pattern',
      },
      capabilities: null,
      demands: null,
      muscles: [
        {
          name: 'Quadriceps',
          slug: 'quadriceps',
          thumbnailUrl: null,
          imageAltText: null,
        },
        {
          name: 'Glutes',
          slug: 'glutes',
          thumbnailUrl: null,
          imageAltText: null,
        },
      ],
      equipment: [
        {
          name: 'Barbell',
          slug: 'barbell',
          description: 'A straight loaded bar used for resistance training.',
        },
        {
          name: 'Rack',
          slug: 'rack',
          description: 'A stable rack for barbell work.',
        },
      ],
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'barbell-back-squat',
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
        description: true,
        instructions: true,
        commonMistakes: true,
        forceType: true,
        kineticChain: true,
        isCompound: true,
        laterality: true,
        contractionMode: true,
        bodyPosition: true,
        skillLevel: true,
        thumbnailUrl: true,
        thumbnailStorageKey: true,
        imageAltText: true,
        movementPattern: {
          select: {
            name: true,
            slug: true,
            description: true,
          },
        },
        capabilities: {
          select: {
            hypertrophyPotential: true,
            maximalStrengthPotential: true,
            powerDevelopmentPotential: true,
            muscularEndurancePotential: true,
            stabilityDevelopmentPotential: true,
            typicalLoadability: true,
            stretchPositionLoading: true,
            shortenedPositionLoading: true,
            editorialNotes: true,
          },
        },
        demands: {
          select: {
            technicalDemand: true,
            setupComplexity: true,
            stabilityDemand: true,
            systemicFatiguePotential: true,
            localFatiguePotential: true,
            recoveryCostPotential: true,
            gripDemand: true,
            axialLoadingPotential: true,
            editorialNotes: true,
          },
        },
        muscles: {
          select: {
            muscle: {
              select: {
                name: true,
                slug: true,
                thumbnailUrl: true,
                imageAltText: true,
              },
            },
          },
        },
        equipment: {
          where: {
            equipment: {
              isActive: true,
            },
          },
          select: {
            equipment: {
              select: {
                name: true,
                slug: true,
                description: true,
              },
            },
          },
        },
      },
    });
  });

  it('throws NotFoundException when an active exercise does not exist', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.findOne('missing-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('archives an exercise without deleting its record', async () => {
    const archivedAt = new Date('2026-08-02T12:00:00.000Z');
    update.mockResolvedValue({
      id: 'exercise-id',
      archivedAt,
    });

    await expect(service.archive('exercise-id')).resolves.toEqual({
      id: 'exercise-id',
      archivedAt,
      message: 'Exercise archived successfully',
    });
    expect(update.mock.calls[0]?.[0]).toMatchObject({
      where: { id: 'exercise-id' },
      data: { isActive: false },
      select: {
        id: true,
        archivedAt: true,
      },
    });
  });
});
