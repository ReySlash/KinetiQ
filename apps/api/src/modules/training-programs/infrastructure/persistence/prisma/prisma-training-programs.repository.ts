import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
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
    await this.prisma.trainingProgram.create({
      data: {
        ...trainingProgram.toValue(),
      },
    });
  }

  async findAll(): Promise<TrainingProgram[]> {
    const rows = await this.prisma.trainingProgram.findMany({
      select: trainingProgramSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });

    return rows.map(toDomain);
  }
}
