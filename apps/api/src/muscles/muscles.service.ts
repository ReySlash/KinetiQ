import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { toPrismaUniqueConstraintBadRequest } from '../common/prisma/prisma-unique-constraint';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { buildMuscleCreateData } from './mappers/create-muscle.mapper';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { buildMuscleUpdateData } from './mappers/update-muscle.mapper';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';

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

  async findOne(slug: string) {
    try {
      const muscle = await this.prisma.muscle.findFirst({
        where: {
          slug,
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
        },
      });
      if (!muscle) {
        throw new NotFoundException('Muscle not found');
      }
      return muscle;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch muscle');
    }
  }

  async update(slug: string, updateMuscleDto: UpdateMuscleDto) {
    const updatedMuscle = buildMuscleUpdateData(updateMuscleDto);

    try {
      await this.prisma.muscle.update({
        where: {
          slug,
        },
        data: updatedMuscle,
      });
      return 'Muscle updated successfully';
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Muscle not found');
      }
      const uniqueConstraintError = toPrismaUniqueConstraintBadRequest(error, {
        entityLabel: 'muscle',
        fieldMessages: {
          name: 'A muscle with that name already exists',
          slug: 'A muscle with that slug already exists',
        },
        resolveField: (detectedField) =>
          updateMuscleDto.slug ? (detectedField ?? 'slug') : 'name',
      });

      if (uniqueConstraintError) {
        throw uniqueConstraintError;
      }
      throw new InternalServerErrorException('Failed to update muscle');
    }
  }
}
