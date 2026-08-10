import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ListTrainingProgramsUseCase } from './application/use-cases/list-training-programs.use-case';
import { TrainingProgramsRepository } from './domain/repositories/training-programs.repository';
import { PrismaTrainingProgramsRepository } from './infrastructure/persistence/prisma/prisma-training-programs.repository';
import { TrainingProgramsController } from './presentation/http/training-programs.controller';
import { CreateTrainingProgramUseCase } from './application/use-cases/create-training-programs.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingProgramsController],
  providers: [
    PrismaTrainingProgramsRepository,
    {
      provide: TrainingProgramsRepository,
      useExisting: PrismaTrainingProgramsRepository,
    },
    {
      provide: ListTrainingProgramsUseCase,
      inject: [TrainingProgramsRepository],
      useFactory: (repository: TrainingProgramsRepository) =>
        new ListTrainingProgramsUseCase(repository),
    },
    {
      provide: CreateTrainingProgramUseCase,
      inject: [TrainingProgramsRepository],
      useFactory: (repository: TrainingProgramsRepository) =>
        new CreateTrainingProgramUseCase(repository),
    },
  ],
})
export class TrainingProgramsModule {}
