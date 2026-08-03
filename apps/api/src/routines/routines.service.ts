import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../prisma/prisma.service';
import { type AuthenticatedPrincipal } from '../auth/principal';
import {
  CreateRoutineDto,
  normalizeRoutineStrings,
  type CreateRoutineExerciseDto,
} from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Prisma } from '../../generated/prisma/client';
import {
  buildRoutinesFindAllQuery,
  mapRoutinesFindAllRows,
} from './helpers/find-all-routines-query';
import { buildRoutinesFindOneQuery } from './helpers/find-one-routines-query';

const MAX_NAME_LENGTH = 120;
const COPY_SUFFIX = ' (Copy)';

@Injectable()
export class RoutinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(principal: AuthenticatedPrincipal, dto: CreateRoutineDto) {
    normalizeRoutineStrings(dto);

    try {
      await this.prisma.$transaction(async (transaction) => {
        await this.assertActiveExercises(
          transaction,
          dto.exercises.map(({ exerciseId }) => exerciseId),
        );
        await transaction.routine.create({
          data: {
            id: randomUUID(),
            ownerId: principal.userId,
            name: dto.name,
            description: dto.description ?? null,
            exercises: {
              create: this.buildExerciseCreateData(dto.exercises),
            },
          },
        });
      });

      return { message: 'Routine created successfully' };
    } catch (error) {
      this.throwWriteError(error);
    }
  }

  async findAll(
    principal: AuthenticatedPrincipal,
    query: FindRoutinesQueryDto,
  ) {
    try {
      const routines = await this.prisma.routine.findMany(
        buildRoutinesFindAllQuery({
          take: query.limit ?? 20,
          skip: query.offset ?? 0,
          search: query.q,
          sort: query.sort,
          ownerId: principal.userId,
        }),
      );

      return mapRoutinesFindAllRows(routines);
    } catch {
      throw new InternalServerErrorException('Failed to fetch routines');
    }
  }

  async findOne(principal: AuthenticatedPrincipal, id: string) {
    try {
      const routine = await this.prisma.routine.findFirst(
        buildRoutinesFindOneQuery(id, principal.userId),
      );

      if (!routine) throw new NotFoundException('Routine not found');
      return routine;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch routine');
    }
  }

  async update(
    principal: AuthenticatedPrincipal,
    id: string,
    dto: UpdateRoutineDto,
  ) {
    normalizeRoutineStrings(dto);

    try {
      await this.prisma.$transaction(async (transaction) => {
        const ownedRoutine = await transaction.routine.findFirst({
          where: { id, ownerId: principal.userId },
          select: { id: true },
        });
        if (!ownedRoutine) throw new NotFoundException('Routine not found');

        if (dto.exercises) {
          await this.assertActiveExercises(
            transaction,
            dto.exercises.map(({ exerciseId }) => exerciseId),
          );
        }

        await transaction.routine.update({
          where: { id },
          data: {
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.description !== undefined
              ? { description: dto.description ?? null }
              : {}),
          },
        });

        if (dto.exercises) {
          await transaction.routineExercise.deleteMany({
            where: { routineId: id },
          });
          if (dto.exercises.length > 0) {
            await transaction.routineExercise.createMany({
              data: this.buildExerciseCreateData(dto.exercises).map(
                (exercise) => ({
                  ...exercise,
                  routineId: id,
                }),
              ),
            });
          }
        }
      });

      return { message: 'Routine updated successfully' };
    } catch (error) {
      this.throwWriteError(error);
    }
  }

  async remove(principal: AuthenticatedPrincipal, id: string) {
    const result = await this.prisma.routine.deleteMany({
      where: { id, ownerId: principal.userId },
    });
    if (result.count === 0) throw new NotFoundException('Routine not found');

    return { message: 'Routine deleted successfully' };
  }

  async duplicate(principal: AuthenticatedPrincipal, id: string) {
    try {
      await this.prisma.$transaction(async (transaction) => {
        const source = await transaction.routine.findFirst({
          where: { id, ownerId: principal.userId },
          select: {
            name: true,
            description: true,
            visibility: true,
            exercises: {
              orderBy: { order: 'asc' },
              select: {
                exerciseId: true,
                order: true,
                sets: true,
                minReps: true,
                maxReps: true,
                targetRir: true,
                restSeconds: true,
                tempo: true,
                notes: true,
              },
            },
          },
        });
        if (!source) throw new NotFoundException('Routine not found');

        const name = await this.findCopyName(
          transaction,
          principal.userId,
          source.name,
        );
        await transaction.routine.create({
          data: {
            id: randomUUID(),
            ownerId: principal.userId,
            name,
            description: source.description,
            visibility: source.visibility,
            exercises: {
              create: source.exercises.map((exercise) => ({
                id: randomUUID(),
                exerciseId: exercise.exerciseId,
                order: exercise.order,
                sets: exercise.sets,
                minReps: exercise.minReps,
                maxReps: exercise.maxReps,
                targetRir: exercise.targetRir,
                restSeconds: exercise.restSeconds,
                tempo: exercise.tempo,
                notes: exercise.notes,
              })),
            },
          },
        });
      });

      return { message: 'Routine duplicated successfully' };
    } catch (error) {
      this.throwWriteError(error);
    }
  }

  private async assertActiveExercises(
    client: Pick<Prisma.TransactionClient, 'exercise'>,
    exerciseIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(exerciseIds)];
    if (uniqueIds.length === 0) return;

    const exercises = await client.exercise.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, isActive: true },
    });
    const activeIds = new Set(
      exercises
        .filter((exercise) => exercise.isActive)
        .map((exercise) => exercise.id),
    );
    if (activeIds.size !== uniqueIds.length) {
      throw new UnprocessableEntityException(
        'Every routine exercise must reference an active exercise.',
      );
    }
  }

  private buildExerciseCreateData(exercises: CreateRoutineExerciseDto[]) {
    return exercises.map((exercise, order) => ({
      id: randomUUID(),
      exerciseId: exercise.exerciseId,
      order,
      sets: exercise.sets,
      minReps: exercise.minReps,
      maxReps: exercise.maxReps,
      targetRir: exercise.targetRir ?? null,
      restSeconds: exercise.restSeconds ?? null,
      tempo: exercise.tempo || null,
      notes: exercise.notes || null,
    }));
  }

  private async findCopyName(
    transaction: Prisma.TransactionClient,
    ownerId: string,
    sourceName: string,
  ): Promise<string> {
    const base = sourceName
      .slice(0, MAX_NAME_LENGTH - COPY_SUFFIX.length)
      .trimEnd();
    let candidate = `${base}${COPY_SUFFIX}`;
    let copyNumber = 2;

    while (
      await transaction.routine.findFirst({
        where: { ownerId, name: candidate },
        select: { id: true },
      })
    ) {
      const suffix = ` (Copy ${copyNumber})`;
      candidate = `${sourceName
        .slice(0, MAX_NAME_LENGTH - suffix.length)
        .trimEnd()}${suffix}`;
      copyNumber += 1;
    }

    return candidate;
  }

  private throwWriteError(error: unknown): never {
    if (
      error instanceof NotFoundException ||
      error instanceof UnprocessableEntityException
    ) {
      throw error;
    }
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new UnprocessableEntityException(
        'Routine references an invalid exercise.',
      );
    }
    throw new InternalServerErrorException('Failed to save routine.');
  }
}
