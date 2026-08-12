import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  TrainingProgramPersistenceError,
  TrainingProgramQueryError,
  TrainingProgramRoutineUnavailableError,
  TrainingProgramScheduleConflictError,
  TrainingProgramSlugConflictError,
} from '../../../application/errors/training-program.errors';
import type { GetTrainingProgramQuery } from '../../../application/models/detail-training-program.model';
import type { ListTrainingProgramsQuery } from '../../../application/models/list-training-programs.model';
import { TrainingProgramsQueryRepository } from '../../../application/repositories/training-programs-query.repository';
import type { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { TrainingProgramsCommandRepository } from '../../../application/repositories/training-programs-command.repository';
import {
  toListItem,
  toDetail,
  trainingProgramDetailSelect,
  trainingProgramListSelect,
} from './prisma-training-program.mapper';

const TRAINING_PROGRAM_ORDER_BY = {
  'updatedAt:asc': ['updatedAt', 'asc'],
  'updatedAt:desc': ['updatedAt', 'desc'],
  'name:asc': ['name', 'asc'],
  'name:desc': ['name', 'desc'],
} as const;

@Injectable()
export class PrismaTrainingProgramsRepository
  implements TrainingProgramsCommandRepository, TrainingProgramsQueryRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async create(trainingProgram: TrainingProgram): Promise<void> {
    try {
      const { schedule, ...program } = trainingProgram.toValue();
      const routineSlugs = [
        ...new Set(schedule.map((entry) => entry.routineSlug)),
      ];

      await this.prisma.$transaction(async (transaction) => {
        const routines = routineSlugs.length
          ? await transaction.routine.findMany({
              where: {
                slug: { in: routineSlugs },
                OR: [
                  { visibility: 'GLOBAL' },
                  { visibility: 'PRIVATE', ownerId: program.ownerId },
                ],
              },
              select: { id: true, slug: true },
            })
          : [];

        if (routines.length !== routineSlugs.length) {
          throw new TrainingProgramRoutineUnavailableError();
        }

        const routineIds = new Map(
          routines.map((routine) => [routine.slug, routine.id]),
        );
        await transaction.trainingProgram.create({
          data: {
            ...program,
            routines: {
              create: schedule.map((entry) => {
                const routineId = routineIds.get(entry.routineSlug);
                if (!routineId) {
                  throw new TrainingProgramRoutineUnavailableError();
                }
                return {
                  id: entry.id,
                  routineId,
                  weekNumber: entry.weekNumber,
                  dayNumber: entry.dayNumber,
                  notes: entry.notes,
                  createdAt: entry.createdAt,
                  updatedAt: entry.updatedAt,
                };
              }),
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof TrainingProgramRoutineUnavailableError) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target;
        const targetFields =
          typeof target === 'string'
            ? [target]
            : Array.isArray(target)
              ? target.filter(
                  (field): field is string => typeof field === 'string',
                )
              : [];
        if (
          targetFields.includes('weekNumber') ||
          targetFields.includes('dayNumber')
        ) {
          throw new TrainingProgramScheduleConflictError();
        }
        throw new TrainingProgramSlugConflictError();
      }

      throw new TrainingProgramPersistenceError();
    }
  }

  async findAll(query: ListTrainingProgramsQuery) {
    try {
      const [sortField, sortDirection] = TRAINING_PROGRAM_ORDER_BY[query.sort];
      const rows = await this.prisma.trainingProgram.findMany({
        where: {
          ...(query.scope === 'my'
            ? { visibility: 'PRIVATE' as const, ownerId: query.ownerId }
            : { visibility: 'GLOBAL' as const }),
          ...(query.q
            ? {
                OR: [
                  { name: { contains: query.q, mode: 'insensitive' as const } },
                  {
                    description: {
                      contains: query.q,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              }
            : {}),
        },
        select: trainingProgramListSelect,
        orderBy: [{ [sortField]: sortDirection }, { id: 'asc' }],
        take: query.limit,
        skip: query.offset,
      });

      return rows.map(toListItem);
    } catch {
      throw new TrainingProgramQueryError();
    }
  }

  async findBySlug(query: GetTrainingProgramQuery) {
    try {
      const row = await this.prisma.trainingProgram.findFirst({
        where: {
          slug: query.slug,
          OR: [
            { visibility: 'GLOBAL' },
            ...(query.ownerId
              ? [{ visibility: 'PRIVATE' as const, ownerId: query.ownerId }]
              : []),
          ],
        },
        select: trainingProgramDetailSelect,
      });

      return row ? toDetail(row) : null;
    } catch {
      throw new TrainingProgramQueryError();
    }
  }
}
