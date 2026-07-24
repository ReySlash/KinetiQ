import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { MuscleGroupsService } from './muscle-groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MuscleGroupsService', () => {
  let service: MuscleGroupsService;
  const prismaMock = {
    muscleGroup: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuscleGroupsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MuscleGroupsService>(MuscleGroupsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should query muscle group by slug and include muscles', async () => {
    prismaMock.muscleGroup.findUnique.mockResolvedValue({
      id: 'group-1',
      name: 'Upper body',
      slug: 'upper-body',
      description: 'Upper body muscle group',
      muscles: [],
    });

    await service.findOne('upper-body');

    expect(prismaMock.muscleGroup.findUnique).toHaveBeenCalledWith({
      where: { slug: 'upper-body' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        muscles: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
          where: {
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
            muscleGroupId: true,
          },
        },
      },
    });
  });

  it('findOne should throw not found when the group does not exist', async () => {
    prismaMock.muscleGroup.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
