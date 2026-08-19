import { Module } from '@nestjs/common';
import { ExercisesController } from './presentation/exercises.controller';
import { AdminExercisesController } from './presentation/admin-exercises.controller';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { PrismaExercisesAdapter } from './infrastructure/prisma/prisma-exercises.adapter';
import { ExercisesCommandPort } from './application/ports/exercises-command.port';
import { ExercisesQueriesPort } from './application/ports/exercises-queries.port';
import { CreateExerciseUseCase } from './application/use-cases/commands/create-exercise.use-case';
import { UpdateExerciseUseCase } from './application/use-cases/commands/update-exercise.use-case';
import { ArchiveExerciseUseCase } from './application/use-cases/commands/archive-exercise.use-case';
import { ListExercisesUseCase } from './application/use-cases/queries/list-exercises.use-case';
import { GetExerciseUseCase } from './application/use-cases/queries/get-exercise.use-case';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [ExercisesController, AdminExercisesController],
  providers: [
    PrismaExercisesAdapter,
    {
      provide: ExercisesCommandPort,
      useExisting: PrismaExercisesAdapter,
    },
    {
      provide: ExercisesQueriesPort,
      useExisting: PrismaExercisesAdapter,
    },
    {
      provide: CreateExerciseUseCase,
      inject: [ExercisesCommandPort],
      useFactory: (port: ExercisesCommandPort) =>
        new CreateExerciseUseCase(port),
    },
    {
      provide: UpdateExerciseUseCase,
      inject: [ExercisesCommandPort],
      useFactory: (port: ExercisesCommandPort) =>
        new UpdateExerciseUseCase(port),
    },
    {
      provide: ArchiveExerciseUseCase,
      inject: [ExercisesCommandPort],
      useFactory: (port: ExercisesCommandPort) =>
        new ArchiveExerciseUseCase(port),
    },
    {
      provide: ListExercisesUseCase,
      inject: [ExercisesQueriesPort],
      useFactory: (port: ExercisesQueriesPort) =>
        new ListExercisesUseCase(port),
    },
    {
      provide: GetExerciseUseCase,
      inject: [ExercisesQueriesPort],
      useFactory: (port: ExercisesQueriesPort) => new GetExerciseUseCase(port),
    },
  ],
})
export class ExercisesModule {}
