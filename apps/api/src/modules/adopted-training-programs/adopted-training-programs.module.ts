import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { AdoptedTrainingProgramExecutionPort } from './application/ports/adopted-training-program-execution.port';
import { AdoptedTrainingProgramSourcesPort } from './application/ports/adopted-training-program-sources.port';
import { AdoptedTrainingProgramsCommandPort } from './application/ports/adopted-training-programs-command.port';
import { AdoptedTrainingProgramsQueryPort } from './application/ports/adopted-training-programs-query.port';
import { AdoptTrainingProgramUseCase } from './application/use-cases/adopt-training-program.use-case';
import { CancelAdoptedTrainingProgramUseCase } from './application/use-cases/cancel-adopted-training-program.use-case';
import { GetAdoptedTrainingProgramUseCase } from './application/use-cases/get-adopted-training-program.use-case';
import { GetNonTerminalAdoptedTrainingProgramUseCase } from './application/use-cases/get-non-terminal-adopted-training-program.use-case';
import { PauseAdoptedTrainingProgramUseCase } from './application/use-cases/pause-adopted-training-program.use-case';
import { ResumeAdoptedTrainingProgramUseCase } from './application/use-cases/resume-adopted-training-program.use-case';
import { SkipProgramWorkoutOccurrenceUseCase } from './application/use-cases/skip-program-workout-occurrence.use-case';
import { StartProgramWorkoutOccurrenceUseCase } from './application/use-cases/start-program-workout-occurrence.use-case';
import { PrismaAdoptedTrainingProgramsAdapter } from './infrastructure/prisma/prisma-adopted-training-programs.adapter';
import { AdoptedTrainingProgramsController } from './presentation/adopted-training-programs.controller';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [AdoptedTrainingProgramsController],
  providers: [
    PrismaAdoptedTrainingProgramsAdapter,
    {
      provide: AdoptedTrainingProgramsCommandPort,
      useExisting: PrismaAdoptedTrainingProgramsAdapter,
    },
    {
      provide: AdoptedTrainingProgramsQueryPort,
      useExisting: PrismaAdoptedTrainingProgramsAdapter,
    },
    {
      provide: AdoptedTrainingProgramSourcesPort,
      useExisting: PrismaAdoptedTrainingProgramsAdapter,
    },
    {
      provide: AdoptedTrainingProgramExecutionPort,
      useExisting: PrismaAdoptedTrainingProgramsAdapter,
    },
    {
      provide: AdoptTrainingProgramUseCase,
      inject: [
        AdoptedTrainingProgramsCommandPort,
        AdoptedTrainingProgramSourcesPort,
      ],
      useFactory: (
        commands: AdoptedTrainingProgramsCommandPort,
        sources: AdoptedTrainingProgramSourcesPort,
      ) => new AdoptTrainingProgramUseCase(commands, sources),
    },
    {
      provide: GetNonTerminalAdoptedTrainingProgramUseCase,
      inject: [AdoptedTrainingProgramsQueryPort],
      useFactory: (queries: AdoptedTrainingProgramsQueryPort) =>
        new GetNonTerminalAdoptedTrainingProgramUseCase(queries),
    },
    {
      provide: GetAdoptedTrainingProgramUseCase,
      inject: [AdoptedTrainingProgramsQueryPort],
      useFactory: (queries: AdoptedTrainingProgramsQueryPort) =>
        new GetAdoptedTrainingProgramUseCase(queries),
    },
    {
      provide: PauseAdoptedTrainingProgramUseCase,
      inject: [AdoptedTrainingProgramsCommandPort],
      useFactory: (commands: AdoptedTrainingProgramsCommandPort) =>
        new PauseAdoptedTrainingProgramUseCase(commands),
    },
    {
      provide: ResumeAdoptedTrainingProgramUseCase,
      inject: [AdoptedTrainingProgramsCommandPort],
      useFactory: (commands: AdoptedTrainingProgramsCommandPort) =>
        new ResumeAdoptedTrainingProgramUseCase(commands),
    },
    {
      provide: CancelAdoptedTrainingProgramUseCase,
      inject: [AdoptedTrainingProgramsCommandPort],
      useFactory: (commands: AdoptedTrainingProgramsCommandPort) =>
        new CancelAdoptedTrainingProgramUseCase(commands),
    },
    {
      provide: StartProgramWorkoutOccurrenceUseCase,
      inject: [AdoptedTrainingProgramExecutionPort],
      useFactory: (execution: AdoptedTrainingProgramExecutionPort) =>
        new StartProgramWorkoutOccurrenceUseCase(execution),
    },
    {
      provide: SkipProgramWorkoutOccurrenceUseCase,
      inject: [AdoptedTrainingProgramsCommandPort],
      useFactory: (commands: AdoptedTrainingProgramsCommandPort) =>
        new SkipProgramWorkoutOccurrenceUseCase(commands),
    },
  ],
})
export class AdoptedTrainingProgramsModule {}
