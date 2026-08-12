import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ListTrainingProgramsUseCase } from './application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from './application/use-cases/queries/get-training-program.use-case';
import { TrainingProgramsCommandRepository } from './application/repositories/training-programs-command.repository';
import { PrismaTrainingProgramsRepository } from './infrastructure/persistence/prisma/prisma-training-programs.repository';
import { TrainingProgramsController } from './presentation/http/training-programs.controller';
import { CreateTrainingProgramUseCase } from './application/use-cases/commands/create-training-programs.use-case';
import { UpdateTrainingProgramUseCase } from './application/use-cases/commands/update-training-program.use-case';
import { TrainingProgramsQueryRepository } from './application/repositories/training-programs-query.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingProgramsController],
  providers: [
    PrismaTrainingProgramsRepository,
    {
      provide: TrainingProgramsCommandRepository,
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
      provide: UpdateTrainingProgramUseCase,
      inject: [TrainingProgramsCommandRepository],
      useFactory: (repository: TrainingProgramsCommandRepository) =>
        new UpdateTrainingProgramUseCase(repository),
    },
    {
      provide: GetTrainingProgramUseCase,
      inject: [TrainingProgramsQueryRepository],
      useFactory: (repository: TrainingProgramsQueryRepository) =>
        new GetTrainingProgramUseCase(repository),
    },
    {
      provide: CreateTrainingProgramUseCase,
      inject: [TrainingProgramsCommandRepository],
      useFactory: (repository: TrainingProgramsCommandRepository) =>
        new CreateTrainingProgramUseCase(repository),
    },
  ],
})
export class TrainingProgramsModule {}
