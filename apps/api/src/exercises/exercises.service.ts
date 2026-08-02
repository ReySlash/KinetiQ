import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';

import { toPrismaUniqueConstraintBadRequest } from '../common/prisma/prisma-unique-constraint';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExerciseDto,
  ExerciseCapabilityProfileDto,
  ExerciseDemandProfileDto,
  ExerciseMuscleAssignmentDto,
} from './dto/create-exercise.dto';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import {
  buildExercisesFindAllQuery,
  mapExercisesFindAllRows,
} from './helpers/find-all-exercises-query';
import {
  buildExercisesFindOneQuery,
  mapExerciseFindOneRow,
} from './helpers/find-one-exercises-query';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    this.validateMuscleAssignments(createExerciseDto.muscles);

    try {
      const exercise = await this.prisma.$transaction(async (transaction) => {
        const createdExercise = await transaction.exercise.create({
          data: this.buildExerciseCreateData(createExerciseDto),
        });

        await this.replaceEquipment(
          transaction,
          createdExercise.id,
          createExerciseDto.equipmentIds,
        );
        await this.replaceMuscles(
          transaction,
          createdExercise.id,
          createExerciseDto.muscles,
        );
        await this.upsertProfiles(
          transaction,
          createdExercise.id,
          createExerciseDto.capabilities,
          createExerciseDto.demands,
        );

        return createdExercise;
      });

      return {
        id: exercise.id,
        slug: exercise.slug,
        message: 'Exercise created successfully',
      };
    } catch (error) {
      this.throwMappedWriteError(error, 'create');
    }
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    if (updateExerciseDto.muscles) {
      this.validateMuscleAssignments(updateExerciseDto.muscles);
    }

    try {
      const exercise = await this.prisma.$transaction(async (transaction) => {
        const existingExercise = await transaction.exercise.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!existingExercise) {
          throw new NotFoundException('Exercise not found');
        }

        const updatedExercise = await transaction.exercise.update({
          where: { id },
          data: this.buildExerciseUpdateData(updateExerciseDto),
        });

        if (updateExerciseDto.equipmentIds) {
          await this.replaceEquipment(
            transaction,
            id,
            updateExerciseDto.equipmentIds,
          );
        }
        if (updateExerciseDto.muscles) {
          await this.replaceMuscles(transaction, id, updateExerciseDto.muscles);
        }
        if (updateExerciseDto.capabilities || updateExerciseDto.demands) {
          await this.upsertProfiles(
            transaction,
            id,
            updateExerciseDto.capabilities,
            updateExerciseDto.demands,
          );
        }

        return updatedExercise;
      });

      return {
        id: exercise.id,
        slug: exercise.slug,
        message: 'Exercise updated successfully',
      };
    } catch (error) {
      this.throwMappedWriteError(error, 'update');
    }
  }

  async archive(id: string) {
    try {
      const exercise = await this.prisma.exercise.update({
        where: { id },
        data: {
          isActive: false,
          archivedAt: new Date(),
        },
        select: {
          id: true,
          archivedAt: true,
        },
      });

      return {
        id: exercise.id,
        archivedAt: exercise.archivedAt,
        message: 'Exercise archived successfully',
      };
    } catch (error) {
      this.throwMappedWriteError(error, 'archive');
    }
  }

  async findAll(findExercisesQueryDto: FindExercisesQueryDto) {
    const {
      limit = 20,
      offset = 0,
      search,
      forceType,
      laterality,
      skillLevel,
    } = findExercisesQueryDto;
    try {
      const exercises = await this.prisma.exercise.findMany(
        buildExercisesFindAllQuery({
          take: limit,
          skip: offset,
          search,
          forceType,
          laterality,
          skillLevel,
        }),
      );

      return mapExercisesFindAllRows(exercises);
    } catch {
      throw new InternalServerErrorException('Failed to fetch exercises');
    }
  }

  async findOne(slug: string) {
    try {
      const exercise = await this.prisma.exercise.findFirst(
        buildExercisesFindOneQuery(slug),
      );
      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }
      return mapExerciseFindOneRow(exercise);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exercise');
    }
  }

  private buildExerciseCreateData(
    dto: CreateExerciseDto,
  ): Prisma.ExerciseUncheckedCreateInput {
    return {
      id: randomUUID(),
      name: dto.name.trim(),
      slug: this.buildSlug(dto.slug ?? dto.name),
      description: dto.description.trim(),
      instructions: dto.instructions.trim(),
      commonMistakes: dto.commonMistakes?.trim() ?? null,
      movementPatternId: dto.movementPatternId,
      forceType: dto.forceType,
      kineticChain: dto.kineticChain,
      isCompound: dto.isCompound,
      laterality: dto.laterality,
      contractionMode: dto.contractionMode,
      bodyPosition: dto.bodyPosition,
      skillLevel: dto.skillLevel,
      thumbnailUrl: dto.thumbnailUrl?.trim() ?? null,
      thumbnailStorageKey: dto.thumbnailStorageKey?.trim() ?? null,
      imageAltText: dto.imageAltText?.trim() ?? null,
      isActive: true,
      archivedAt: null,
    };
  }

  private buildExerciseUpdateData(
    dto: UpdateExerciseDto,
  ): Prisma.ExerciseUncheckedUpdateInput {
    const data: Prisma.ExerciseUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.slug !== undefined) data.slug = this.buildSlug(dto.slug);
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.instructions !== undefined) {
      data.instructions = dto.instructions.trim();
    }
    if (dto.commonMistakes !== undefined) {
      data.commonMistakes = dto.commonMistakes?.trim() ?? null;
    }
    if (dto.movementPatternId !== undefined) {
      data.movementPatternId = dto.movementPatternId;
    }
    if (dto.forceType !== undefined) data.forceType = dto.forceType;
    if (dto.kineticChain !== undefined) data.kineticChain = dto.kineticChain;
    if (dto.isCompound !== undefined) data.isCompound = dto.isCompound;
    if (dto.laterality !== undefined) data.laterality = dto.laterality;
    if (dto.contractionMode !== undefined) {
      data.contractionMode = dto.contractionMode;
    }
    if (dto.bodyPosition !== undefined) data.bodyPosition = dto.bodyPosition;
    if (dto.skillLevel !== undefined) data.skillLevel = dto.skillLevel;
    if (dto.thumbnailUrl !== undefined) {
      data.thumbnailUrl = dto.thumbnailUrl?.trim() ?? null;
    }
    if (dto.thumbnailStorageKey !== undefined) {
      data.thumbnailStorageKey = dto.thumbnailStorageKey?.trim() ?? null;
    }
    if (dto.imageAltText !== undefined) {
      data.imageAltText = dto.imageAltText?.trim() ?? null;
    }

    return data;
  }

  private async replaceEquipment(
    transaction: Prisma.TransactionClient,
    exerciseId: string,
    equipmentIds: string[],
  ): Promise<void> {
    await transaction.exerciseEquipment.deleteMany({ where: { exerciseId } });
    await transaction.exerciseEquipment.createMany({
      data: equipmentIds.map((equipmentId) => ({ exerciseId, equipmentId })),
    });
  }

  private async replaceMuscles(
    transaction: Prisma.TransactionClient,
    exerciseId: string,
    muscles: ExerciseMuscleAssignmentDto[],
  ): Promise<void> {
    await transaction.exerciseMuscle.deleteMany({ where: { exerciseId } });
    await transaction.exerciseMuscle.createMany({
      data: muscles.map((muscle) => ({
        exerciseId,
        muscleId: muscle.muscleId,
        role: muscle.role,
        involvementScore: muscle.involvementScore,
        notes: muscle.notes?.trim() ?? null,
      })),
    });
  }

  private async upsertProfiles(
    transaction: Prisma.TransactionClient,
    exerciseId: string,
    capabilities?: ExerciseCapabilityProfileDto,
    demands?: ExerciseDemandProfileDto,
  ): Promise<void> {
    if (capabilities) {
      await transaction.exerciseCapabilityProfile.upsert({
        where: { exerciseId },
        create: { exerciseId, ...capabilities },
        update: { ...capabilities },
      });
    }
    if (demands) {
      await transaction.exerciseDemandProfile.upsert({
        where: { exerciseId },
        create: { exerciseId, ...demands },
        update: { ...demands },
      });
    }
  }

  private validateMuscleAssignments(
    muscles: ExerciseMuscleAssignmentDto[],
  ): void {
    const muscleIds = muscles.map((muscle) => muscle.muscleId);
    if (new Set(muscleIds).size !== muscleIds.length) {
      throw new BadRequestException('Each muscle may be assigned only once.');
    }
    if (!muscles.some((muscle) => muscle.role === 'PRIMARY')) {
      throw new BadRequestException(
        'An exercise must have at least one primary muscle.',
      );
    }
  }

  private buildSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private throwMappedWriteError(error: unknown, operation: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Exercise not found');
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException('Exercise references an unknown record.');
    }

    const uniqueConstraintError = toPrismaUniqueConstraintBadRequest(error, {
      entityLabel: 'exercise',
      fieldMessages: {
        name: 'An exercise with that name already exists',
        slug: 'An exercise with that slug already exists',
      },
    });
    if (uniqueConstraintError) throw uniqueConstraintError;

    throw new InternalServerErrorException(`Failed to ${operation} exercise`);
  }
}
