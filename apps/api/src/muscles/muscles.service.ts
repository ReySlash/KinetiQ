import { randomUUID } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { PrismaService } from '../prisma/prisma.service';

type PrismaP2002Meta = {
  target?: string[];
  modelName?: string;
  driverAdapterError?: {
    cause?: {
      constraint?: {
        fields?: string[];
      };
    };
  };
};

type UniqueViolationError = {
  code?: string;
  meta?: PrismaP2002Meta;
};

type MuscleConflictField = 'name' | 'slug';

function buildMuscleSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getMuscleConflictField(
  error: UniqueViolationError,
): MuscleConflictField | undefined {
  const field =
    error.meta?.target?.[0] ??
    error.meta?.driverAdapterError?.cause?.constraint?.fields?.[0];

  if (field === 'name' || field === 'slug') {
    return field;
  }

  return undefined;
}

@Injectable()
export class MusclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMuscleDto: CreateMuscleDto) {
    const name = createMuscleDto.name.trim();
    const slugSource = createMuscleDto.slug ?? name;
    const slug = buildMuscleSlug(slugSource);

    if (!name) {
      throw new BadRequestException({
        message: 'Muscle name cannot be empty',
        field: 'name',
      });
    }

    if (!slug) {
      throw new BadRequestException({
        message:
          'Muscle name or slug must contain at least one letter or number',
        field: createMuscleDto.slug ? 'slug' : 'name',
      });
    }

    const [existingName, existingSlug] = await Promise.all([
      this.prisma.muscle.findUnique({
        where: { name },
        select: { id: true },
      }),
      this.prisma.muscle.findUnique({
        where: { slug },
        select: { id: true },
      }),
    ]);

    if (existingName) {
      throw new BadRequestException({
        message: 'A muscle with that name already exists',
        field: 'name',
      });
    }

    if (existingSlug) {
      throw new BadRequestException({
        message: 'A muscle with that slug already exists',
        field: 'slug',
      });
    }

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
      const uniqueViolation = error as UniqueViolationError;

      if (uniqueViolation.code === 'P2002') {
        const field = getMuscleConflictField(uniqueViolation);
        const message =
          field === 'name'
            ? 'A muscle with that name already exists'
            : field === 'slug'
              ? 'A muscle with that slug already exists'
              : 'A muscle with that value already exists';

        throw new BadRequestException({
          message,
          ...(field ? { field } : {}),
        });
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
