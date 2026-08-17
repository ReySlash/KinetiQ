import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../modules/shared/infrastructure/database/prisma/prisma.service';
import {
  MuscleNameConflictError,
  MuscleNotFoundError,
  MusclePersistenceError,
  MuscleQueryError,
  MuscleSlugConflictError,
} from '../../application/errors/muscle.errors';
import type { MuscleDetails } from '../../application/models/get-muscles.models';
import type { ListMusclesQueryParams } from '../../application/models/list-muscles.models';
import type { UpdateMuscleInput } from '../../application/models/update-muscle.input';
import { MusclesCommandPort } from '../../application/ports/muscles-command.port';
import { MusclesQueriesPort } from '../../application/ports/muscles-queries.port';
import { Muscle } from '../../domain/entities/muscle.entity';
import type { PrimitiveMuscle } from '../../domain/entities/muscle.types';
import {
  muscleAggregateSelect,
  muscleDetailSelect,
  muscleListSelect,
  toCreateData,
  toDetail,
  toListItem,
  toUpdateData,
} from './prisma-muscles.mapper';

@Injectable()
export class PrismaMusclesAdapter
  implements MusclesCommandPort, MusclesQueriesPort
{
  constructor(private readonly prisma: PrismaService) {}

  async create(muscle: Muscle): Promise<void> {
    try {
      await this.prisma.muscle.create({ data: toCreateData(muscle) });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async updateBySlug(slug: string, input: UpdateMuscleInput): Promise<void> {
    let existing: PrimitiveMuscle | null;
    try {
      existing = await this.prisma.muscle.findUnique({
        where: { slug },
        select: muscleAggregateSelect,
      });
    } catch {
      throw new MusclePersistenceError();
    }

    if (!existing) {
      throw new MuscleNotFoundError();
    }

    const updated = Muscle.reconstitute(existing).update(input);
    try {
      await this.prisma.muscle.update({
        where: { id: updated.id.value },
        data: toUpdateData(updated),
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async deactivateById(id: string): Promise<void> {
    try {
      await this.prisma.muscle.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new MuscleNotFoundError();
      }
      throw new MusclePersistenceError();
    }
  }

  async findBySlug(slug: string): Promise<MuscleDetails | null> {
    try {
      const row = await this.prisma.muscle.findFirst({
        where: { slug, isActive: true },
        select: muscleDetailSelect,
      });
      return row ? toDetail(row) : null;
    } catch {
      throw new MuscleQueryError();
    }
  }

  async list({ limit = 20, offset = 0 }: ListMusclesQueryParams) {
    try {
      const rows = await this.prisma.muscle.findMany({
        where: { isActive: true },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        take: limit,
        skip: offset,
        select: muscleListSelect,
      });
      return rows.map(toListItem);
    } catch {
      throw new MuscleQueryError();
    }
  }

  private throwPersistenceError(error: unknown): never {
    if (this.isPrismaError(error, 'P2025')) {
      throw new MuscleNotFoundError();
    }

    if (this.isPrismaError(error, 'P2002')) {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.filter((field): field is string => typeof field === 'string')
        : typeof target === 'string'
          ? [target]
          : [];
      if (fields.includes('name')) {
        throw new MuscleNameConflictError();
      }
      if (fields.includes('slug')) {
        throw new MuscleSlugConflictError();
      }
    }
    throw new MusclePersistenceError();
  }

  private isPrismaError(
    error: unknown,
    code: string,
  ): error is PrismaClientKnownRequestError {
    return (
      error instanceof PrismaClientKnownRequestError && error.code === code
    );
  }
}
