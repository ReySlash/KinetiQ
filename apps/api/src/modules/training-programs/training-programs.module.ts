import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { ListTrainingProgramsUseCase } from './application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from './application/use-cases/queries/get-training-program.use-case';
import { TrainingProgramsCommandPort } from './application/ports/training-programs-command.port';
import { PrismaTrainingProgramsAdapter } from './infrastructure/prisma/prisma-training-programs.adapter';
import { TrainingProgramsController } from './presentation/training-programs.controller';
import { CreateTrainingProgramUseCase } from './application/use-cases/commands/create-training-programs.use-case';
import { UpdateTrainingProgramUseCase } from './application/use-cases/commands/update-training-program.use-case';
import { DeleteTrainingProgramUseCase } from './application/use-cases/commands/delete-training-program.use-case';
import { TrainingProgramsQueryPort } from './application/ports/training-programs-query.port';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [TrainingProgramsController],
  providers: [
    PrismaTrainingProgramsAdapter,
    {
      provide: TrainingProgramsCommandPort,
      useExisting: PrismaTrainingProgramsAdapter,
    },
    {
      provide: TrainingProgramsQueryPort,
      useExisting: PrismaTrainingProgramsAdapter,
    },
    {
      provide: ListTrainingProgramsUseCase,
      inject: [TrainingProgramsQueryPort],
      useFactory: (port: TrainingProgramsQueryPort) =>
        new ListTrainingProgramsUseCase(port),
    },
    {
      provide: UpdateTrainingProgramUseCase,
      inject: [TrainingProgramsCommandPort],
      useFactory: (port: TrainingProgramsCommandPort) =>
        new UpdateTrainingProgramUseCase(port),
    },
    {
      provide: DeleteTrainingProgramUseCase,
      inject: [TrainingProgramsCommandPort],
      useFactory: (port: TrainingProgramsCommandPort) =>
        new DeleteTrainingProgramUseCase(port),
    },
    {
      provide: GetTrainingProgramUseCase,
      inject: [TrainingProgramsQueryPort],
      useFactory: (port: TrainingProgramsQueryPort) =>
        new GetTrainingProgramUseCase(port),
    },
    {
      provide: CreateTrainingProgramUseCase,
      inject: [TrainingProgramsCommandPort],
      useFactory: (port: TrainingProgramsCommandPort) =>
        new CreateTrainingProgramUseCase(port),
    },
  ],
})
export class TrainingProgramsModule {}
