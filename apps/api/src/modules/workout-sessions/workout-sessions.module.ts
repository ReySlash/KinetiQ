import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { WorkoutSessionSourcesPort } from './application/ports/workout-session-sources.port';
import { WorkoutSessionsCommandPort } from './application/ports/workout-sessions-command.port';
import { WorkoutSessionsQueryPort } from './application/ports/workout-sessions-query.port';
import { AddWorkoutExerciseUseCase } from './application/use-cases/commands/add-workout-exercise.use-case';
import { CancelWorkoutUseCase } from './application/use-cases/commands/cancel-workout.use-case';
import { CompleteWorkoutUseCase } from './application/use-cases/commands/complete-workout.use-case';
import { DeleteWorkoutSetUseCase } from './application/use-cases/commands/delete-workout-set.use-case';
import { RecordWorkoutSetUseCase } from './application/use-cases/commands/record-workout-set.use-case';
import { RemoveWorkoutExerciseUseCase } from './application/use-cases/commands/remove-workout-exercise.use-case';
import { StartWorkoutUseCase } from './application/use-cases/commands/start-workout.use-case';
import { UpdateWorkoutSetUseCase } from './application/use-cases/commands/update-workout-set.use-case';
import { GetActiveWorkoutUseCase } from './application/use-cases/queries/get-active-workout.use-case';
import { GetExerciseHistoryUseCase } from './application/use-cases/queries/get-exercise-history.use-case';
import { GetWorkoutUseCase } from './application/use-cases/queries/get-workout.use-case';
import { ListWorkoutHistoryUseCase } from './application/use-cases/queries/list-workout-history.use-case';
import { PrismaWorkoutSessionsAdapter } from './infrastructure/prisma/prisma-workout-sessions.adapter';
import { WorkoutSessionsController } from './presentation/workout-sessions.controller';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [WorkoutSessionsController],
  providers: [
    PrismaWorkoutSessionsAdapter,
    {
      provide: WorkoutSessionsCommandPort,
      useExisting: PrismaWorkoutSessionsAdapter,
    },
    {
      provide: WorkoutSessionsQueryPort,
      useExisting: PrismaWorkoutSessionsAdapter,
    },
    {
      provide: WorkoutSessionSourcesPort,
      useExisting: PrismaWorkoutSessionsAdapter,
    },
    {
      provide: StartWorkoutUseCase,
      inject: [
        WorkoutSessionsCommandPort,
        WorkoutSessionsQueryPort,
        WorkoutSessionSourcesPort,
      ],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
        sources: WorkoutSessionSourcesPort,
      ) => new StartWorkoutUseCase(commands, queries, sources),
    },
    {
      provide: AddWorkoutExerciseUseCase,
      inject: [
        WorkoutSessionsCommandPort,
        WorkoutSessionsQueryPort,
        WorkoutSessionSourcesPort,
      ],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
        sources: WorkoutSessionSourcesPort,
      ) => new AddWorkoutExerciseUseCase(commands, queries, sources),
    },
    {
      provide: RemoveWorkoutExerciseUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new RemoveWorkoutExerciseUseCase(commands, queries),
    },
    {
      provide: RecordWorkoutSetUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new RecordWorkoutSetUseCase(commands, queries),
    },
    {
      provide: UpdateWorkoutSetUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new UpdateWorkoutSetUseCase(commands, queries),
    },
    {
      provide: DeleteWorkoutSetUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new DeleteWorkoutSetUseCase(commands, queries),
    },
    {
      provide: CompleteWorkoutUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new CompleteWorkoutUseCase(commands, queries),
    },
    {
      provide: CancelWorkoutUseCase,
      inject: [WorkoutSessionsCommandPort, WorkoutSessionsQueryPort],
      useFactory: (
        commands: WorkoutSessionsCommandPort,
        queries: WorkoutSessionsQueryPort,
      ) => new CancelWorkoutUseCase(commands, queries),
    },
    {
      provide: GetActiveWorkoutUseCase,
      inject: [WorkoutSessionsQueryPort],
      useFactory: (queries: WorkoutSessionsQueryPort) =>
        new GetActiveWorkoutUseCase(queries),
    },
    {
      provide: GetWorkoutUseCase,
      inject: [WorkoutSessionsQueryPort],
      useFactory: (queries: WorkoutSessionsQueryPort) =>
        new GetWorkoutUseCase(queries),
    },
    {
      provide: ListWorkoutHistoryUseCase,
      inject: [WorkoutSessionsQueryPort],
      useFactory: (queries: WorkoutSessionsQueryPort) =>
        new ListWorkoutHistoryUseCase(queries),
    },
    {
      provide: GetExerciseHistoryUseCase,
      inject: [WorkoutSessionsQueryPort],
      useFactory: (queries: WorkoutSessionsQueryPort) =>
        new GetExerciseHistoryUseCase(queries),
    },
  ],
})
export class WorkoutSessionsModule {}
