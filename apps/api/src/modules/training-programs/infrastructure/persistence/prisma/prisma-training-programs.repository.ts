import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/wasm-compiler-edge';
import { PrismaService } from '../../../../../prisma/prisma.service';
import {
  TrainingProgramPersistenceError,
  TrainingProgramSlugConflictError,
} from '../../../application/errors/training-program.errors';
import type { TrainingProgram } from '../../../domain/entities/training-program.entity';
import { TrainingProgramsRepository } from '../../../domain/repositories/training-programs.repository';
import {
  toDomain,
  trainingProgramSelect,
} from './prisma-training-program.mapper';

@Injectable()
export class PrismaTrainingProgramsRepository implements TrainingProgramsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(trainingProgram: TrainingProgram): Promise<void> {
    try {
      await this.prisma.trainingProgram.create({
        data: {
          ...trainingProgram.toValue(),
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new TrainingProgramSlugConflictError();
      }

      throw new TrainingProgramPersistenceError();
    }
  }

  async findAll(): Promise<TrainingProgram[]> {
    const rows = await this.prisma.trainingProgram.findMany({
      select: trainingProgramSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });

    return rows.map(toDomain);
  }
}
