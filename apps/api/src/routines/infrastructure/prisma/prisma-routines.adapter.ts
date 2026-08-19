import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../modules/shared/infrastructure/database/prisma/prisma.service';
import {
  RoutineExerciseUnavailableError,
  RoutineNotFoundError,
  RoutinePersistenceError,
  RoutineQueryError,
} from '../../application/errors/routine.errors';
import type { ListRoutinesQuery } from '../../application/models/list-routines.model';
import { RoutinesCommandPort } from '../../application/ports/routines-command.port';
import { RoutinesQueryPort } from '../../application/ports/routines-query.port';
import { Routine } from '../../domain/entities/routine.entity';
import {
  buildRoutinesFindAllQuery,
  routineAggregateSelect,
  routineFindOneSelect,
  toCreateData,
  toDetail,
  toDomain,
  toExerciseCreateData,
  toListItem,
  toUpdateData,
} from './prisma-routines.mapper';

@Injectable()
export class PrismaRoutinesAdapter
  implements RoutinesCommandPort, RoutinesQueryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListRoutinesQuery) {
    try {
      const rows = await this.prisma.routine.findMany(
        buildRoutinesFindAllQuery(query),
      );
      return rows.map(toListItem);
    } catch {
      throw new RoutineQueryError();
    }
  }

  async findBySlug(query: { slug: string; ownerId?: string }) {
    try {
      const row = await this.prisma.routine.findFirst({
        select: routineFindOneSelect,
        where: {
          slug: query.slug,
          ...(query.ownerId
            ? { OR: [{ visibility: 'GLOBAL' }, { ownerId: query.ownerId }] }
            : { visibility: 'GLOBAL' }),
        },
      });
      return row ? toDetail(row) : null;
    } catch {
      throw new RoutineQueryError();
    }
  }

  async findOwnedPrivateBySlug(
    slug: string,
    ownerId: string,
  ): Promise<Routine | null> {
    return this.findAggregate({ slug, ownerId, visibility: 'PRIVATE' });
  }

  async findAccessibleAggregate(
    slug: string,
    ownerId: string,
  ): Promise<Routine | null> {
    return this.findAggregate({
      slug,
      OR: [{ visibility: 'GLOBAL' }, { ownerId, visibility: 'PRIVATE' }],
    });
  }

  async findCopyName(ownerId: string, sourceName: string): Promise<string> {
    try {
      const suffix = ' (Copy)';
      let candidate = `${sourceName.slice(0, 120 - suffix.length).trimEnd()}${suffix}`;
      let copyNumber = 2;
      while (
        await this.prisma.routine.findFirst({
          where: { ownerId, name: candidate },
          select: { id: true },
        })
      ) {
        const nextSuffix = ` (Copy ${copyNumber})`;
        candidate = `${sourceName.slice(0, 120 - nextSuffix.length).trimEnd()}${nextSuffix}`;
        copyNumber += 1;
      }
      return candidate;
    } catch {
      throw new RoutinePersistenceError();
    }
  }

  async create(routine: Routine): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        await this.assertActiveExercises(transaction, routine);
        await transaction.routine.create({
          data: {
            ...toCreateData(routine),
            exercises: { create: toExerciseCreateData(routine) },
          },
        });
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async update(routine: Routine): Promise<void> {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const existing = await transaction.routine.findUnique({
          where: { id: routine.id.value },
          select: { exercises: { select: { id: true } } },
        });
        if (!existing) throw new RoutineNotFoundError();

        const currentIds = existing.exercises.map(({ id }) => id);
        const nextIds = routine.exercises.map((exercise) => exercise.id);
        const childrenReplaced =
          currentIds.length !== nextIds.length ||
          currentIds.some((id, index) => id !== nextIds[index]);
        if (childrenReplaced)
          await this.assertActiveExercises(transaction, routine);

        await transaction.routine.update({
          where: { id: routine.id.value },
          data: toUpdateData(routine),
        });
        if (childrenReplaced) {
          await transaction.routineExercise.deleteMany({
            where: { routineId: routine.id.value },
          });
          await transaction.routineExercise.createMany({
            data: toExerciseCreateData(routine).map((exercise) => ({
              ...exercise,
              routineId: routine.id.value,
            })),
          });
        }
      });
    } catch (error) {
      this.throwPersistenceError(error);
    }
  }

  async deleteOwnedPrivateBySlug(slug: string, ownerId: string): Promise<void> {
    try {
      const result = await this.prisma.routine.deleteMany({
        where: { slug, ownerId, visibility: 'PRIVATE' },
      });
      if (result.count === 0) throw new RoutineNotFoundError();
    } catch (error) {
      if (error instanceof RoutineNotFoundError) throw error;
      throw new RoutinePersistenceError();
    }
  }

  private async findAggregate(
    where: Prisma.RoutineWhereInput,
  ): Promise<Routine | null> {
    try {
      const row = await this.prisma.routine.findFirst({
        where,
        select: routineAggregateSelect,
      });
      return row ? toDomain(row) : null;
    } catch {
      throw new RoutineQueryError();
    }
  }

  private async assertActiveExercises(
    transaction: Pick<Prisma.TransactionClient, 'exercise'>,
    routine: Routine,
  ): Promise<void> {
    const slugs = [
      ...new Set(routine.exercises.map((exercise) => exercise.exerciseSlug)),
    ];
    if (slugs.length === 0) return;
    const rows = await transaction.exercise.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, isActive: true },
    });
    const active = new Set(
      rows
        .filter((exercise) => exercise.isActive)
        .map((exercise) => exercise.slug),
    );
    if (active.size !== slugs.length)
      throw new RoutineExerciseUnavailableError();
  }

  private throwPersistenceError(error: unknown): never {
    if (
      error instanceof RoutineNotFoundError ||
      error instanceof RoutineExerciseUnavailableError
    ) {
      throw error;
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new RoutineNotFoundError();
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new RoutineExerciseUnavailableError();
    }
    throw new RoutinePersistenceError();
  }
}
