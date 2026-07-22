import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { toPrismaUniqueConstraintBadRequest } from '../common/prisma/prisma-unique-constraint';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { buildMuscleCreateData } from './mappers/create-muscle.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from './dto/pagination-muscle.dto';

@Injectable()
export class MusclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMuscleDto: CreateMuscleDto) {
    const newMuscle = buildMuscleCreateData(createMuscleDto);

    try {
      await this.prisma.muscle.create({
        data: newMuscle,
      });

      return {
        message: 'Muscle created successfully',
      };
    } catch (error) {
      const uniqueConstraintError = toPrismaUniqueConstraintBadRequest(error, {
        entityLabel: 'muscle',
        fieldMessages: {
          name: 'A muscle with that name already exists',
          slug: 'A muscle with that slug already exists',
        },
        resolveField: (detectedField) =>
          createMuscleDto.slug ? (detectedField ?? 'slug') : 'name',
      });

      if (uniqueConstraintError) {
        throw uniqueConstraintError;
      }

      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0 } = paginationDto;

    try {
      const muscles = await this.prisma.muscle.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        take: limit,
        skip: offset,
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
      return muscles;
    } catch {
      throw new InternalServerErrorException('Failed to fetch muscles');
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} muscle`;
  }
}
