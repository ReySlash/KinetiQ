import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MuscleGroupsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    try {
      const muscleGroups = await this.prisma.muscleGroup.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      });
      return muscleGroups;
    } catch {
      throw new InternalServerErrorException('Failed to fetch muscle groups');
    }
  }

  async findOne(slug: string) {
    try {
      const muscleGroup = await this.prisma.muscleGroup.findUnique({
        where: {
          slug,
        },
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

      if (!muscleGroup) {
        throw new NotFoundException('Muscle group not found.');
      }
      return muscleGroup;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Muscle group not found.');
      }
      throw new InternalServerErrorException('Failed to fetch muscle group');
    }
  }
}
