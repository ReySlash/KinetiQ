import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';
import { ExercisesCommandPort } from '../../application/ports/exercises-command.port';
import { ExercisesQueriesPort } from '../../application/ports/exercises-queries.port';
import type { ListExercisesQuery } from '../../application/models/list-exercises.models';
import { Exercise } from '../../domain/entities/exercise.entity';
import {
  ExerciseNameConflictError,
  ExerciseNotFoundError,
  ExercisePersistenceError,
  ExerciseQueryError,
  ExerciseRelatedRecordError,
  ExerciseSlugConflictError,
} from '../../application/errors/exercise.errors';
import {
  buildExercisesFindAllQuery,
  exerciseAggregateSelect,
  exerciseFindOneSelect,
  toCreateData,
  toDetail,
  toDomain,
  toListItem,
  toUpdateData,
} from './prisma-exercises.mapper';

@Injectable()
export class PrismaExercisesAdapter
  implements ExercisesCommandPort, ExercisesQueriesPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListExercisesQuery) {
    try {
      const rows = await this.prisma.exercise.findMany(
        buildExercisesFindAllQuery(query),
      );
      return rows.map((row) => toListItem(row));
    } catch {
      throw new ExerciseQueryError();
    }
  }

  async findBySlug(slug: string) {
    try {
      const row = await this.prisma.exercise.findFirst({
        where: { slug, isActive: true },
        select: exerciseFindOneSelect,
      });
      return row ? toDetail(row) : null;
    } catch {
      throw new ExerciseQueryError();
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    try {
      const row = await this.prisma.exercise.findUnique({
        where: { id },
        select: exerciseAggregateSelect,
      });
      return row ? toDomain(row) : null;
    } catch {
      throw new ExerciseQueryError();
    }
  }

  async create(exercise: Exercise): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const value = exercise.toValue();
        await transaction.exercise.create({ data: toCreateData(exercise) });
        await transaction.exerciseEquipment.createMany({
          data: value.equipmentIds.map((equipmentId) => ({
            exerciseId: value.id,
            equipmentId,
          })),
        });
        await transaction.exerciseMuscle.createMany({
          data: value.muscles.map((muscle) => ({
            exerciseId: value.id,
            ...muscle,
          })),
        });
        if (value.capabilities) {
          await transaction.exerciseCapabilityProfile.create({
            data: { exerciseId: value.id, ...value.capabilities },
          });
        }
        if (value.demands) {
          await transaction.exerciseDemandProfile.create({
            data: { exerciseId: value.id, ...value.demands },
          });
        }
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async update(exercise: Exercise): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const value = exercise.toValue();
        await transaction.exercise.update({
          where: { id: value.id },
          data: toUpdateData(exercise),
        });
        await transaction.exerciseEquipment.deleteMany({
          where: { exerciseId: value.id },
        });
        await transaction.exerciseEquipment.createMany({
          data: value.equipmentIds.map((equipmentId) => ({
            exerciseId: value.id,
            equipmentId,
          })),
        });
        await transaction.exerciseMuscle.deleteMany({
          where: { exerciseId: value.id },
        });
        await transaction.exerciseMuscle.createMany({
          data: value.muscles.map((muscle) => ({
            exerciseId: value.id,
            ...muscle,
          })),
        });
        if (value.capabilities) {
          await transaction.exerciseCapabilityProfile.upsert({
            where: { exerciseId: value.id },
            create: { exerciseId: value.id, ...value.capabilities },
            update: value.capabilities,
          });
        }
        if (value.demands) {
          await transaction.exerciseDemandProfile.upsert({
            where: { exerciseId: value.id },
            create: { exerciseId: value.id, ...value.demands },
            update: value.demands,
          });
        }
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async archive(exercise: Exercise): Promise<void> {
    try {
      const value = exercise.toValue();
      await this.prisma.exercise.update({
        where: { id: value.id },
        data: { isActive: false, archivedAt: value.archivedAt },
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  private throwPersistenceError(error: unknown): never {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new ExerciseNotFoundError();
      if (error.code === 'P2003') throw new ExerciseRelatedRecordError();
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target)
          ? target.filter((field): field is string => typeof field === 'string')
          : typeof target === 'string'
            ? [target]
            : [];
        if (fields.includes('name')) throw new ExerciseNameConflictError();
        if (fields.includes('slug')) throw new ExerciseSlugConflictError();
      }
    }
    throw new ExercisePersistenceError();
  }
}
