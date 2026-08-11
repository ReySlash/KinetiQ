import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ListTrainingProgramsUseCase } from './application/use-cases/queries/list-training-programs.use-case';
import { TrainingProgramsRepository } from './application/repositories/training-programs.repository';
import { PrismaTrainingProgramsRepository } from './infrastructure/persistence/prisma/prisma-training-programs.repository';
import { TrainingProgramsController } from './presentation/http/training-programs.controller';
import { CreateTrainingProgramUseCase } from './application/use-cases/commands/create-training-programs.use-case';
import { TrainingProgramsQueryRepository } from './application/repositories/training-programs-query.repository';

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
      provide: TrainingProgramsQueryRepository,
      useExisting: PrismaTrainingProgramsRepository,
    },
    {
      provide: ListTrainingProgramsUseCase,
      inject: [TrainingProgramsQueryRepository],
      useFactory: (repository: TrainingProgramsQueryRepository) =>
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
