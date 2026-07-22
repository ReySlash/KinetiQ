import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { toPrismaUniqueConstraintBadRequest } from '../common/prisma/prisma-unique-constraint';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { PrismaService } from '../prisma/prisma.service';

function buildMuscleSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class MusclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMuscleDto: CreateMuscleDto) {
    const name = createMuscleDto.name;
    const slugSource = createMuscleDto.slug ?? name;
    const slug = buildMuscleSlug(slugSource);

    const newMuscle: Prisma.MuscleUncheckedCreateInput = {
      id: randomUUID(),
      name,
      slug,
      description: createMuscleDto.description,
      bodyRegion: createMuscleDto.bodyRegion,
      thumbnailUrl: createMuscleDto.thumbnailUrl ?? null,
      thumbnailStorageKey: createMuscleDto.thumbnailStorageKey ?? null,
      imageAltText: createMuscleDto.imageAltText ?? null,
      muscleGroupId: createMuscleDto.muscleGroupId ?? null,
      parentId: createMuscleDto.parentId ?? null,
      sortOrder: createMuscleDto.sortOrder ?? 0,
    };

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

  findAll() {
    return `This action returns all muscles`;
  }

  findOne(id: string) {
    return `This action returns a #${id} muscle`;
  }
}
