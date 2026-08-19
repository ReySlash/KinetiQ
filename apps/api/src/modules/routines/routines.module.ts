import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../shared/infrastructure/database/shared-database.module';
import { CreateRoutineUseCase } from './application/use-cases/commands/create-routine.use-case';
import { DeleteRoutineUseCase } from './application/use-cases/commands/delete-routine.use-case';
import { DuplicateRoutineUseCase } from './application/use-cases/commands/duplicate-routine.use-case';
import { UpdateRoutineUseCase } from './application/use-cases/commands/update-routine.use-case';
import { GetRoutineUseCase } from './application/use-cases/queries/get-routine.use-case';
import { ListRoutinesUseCase } from './application/use-cases/queries/list-routines.use-case';
import { RoutinesCommandPort } from './application/ports/routines-command.port';
import { RoutinesQueryPort } from './application/ports/routines-query.port';
import { PrismaRoutinesAdapter } from './infrastructure/prisma/prisma-routines.adapter';
import { RoutinesController } from './presentation/routines.controller';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [RoutinesController],
  providers: [
    PrismaRoutinesAdapter,
    {
      provide: RoutinesCommandPort,
      useExisting: PrismaRoutinesAdapter,
    },
    {
      provide: RoutinesQueryPort,
      useExisting: PrismaRoutinesAdapter,
    },
    {
      provide: CreateRoutineUseCase,
      inject: [RoutinesCommandPort],
      useFactory: (port: RoutinesCommandPort) => new CreateRoutineUseCase(port),
    },
    {
      provide: UpdateRoutineUseCase,
      inject: [RoutinesCommandPort],
      useFactory: (port: RoutinesCommandPort) => new UpdateRoutineUseCase(port),
    },
    {
      provide: DeleteRoutineUseCase,
      inject: [RoutinesCommandPort],
      useFactory: (port: RoutinesCommandPort) => new DeleteRoutineUseCase(port),
    },
    {
      provide: DuplicateRoutineUseCase,
      inject: [RoutinesCommandPort],
      useFactory: (port: RoutinesCommandPort) =>
        new DuplicateRoutineUseCase(port),
    },
    {
      provide: ListRoutinesUseCase,
      inject: [RoutinesQueryPort],
      useFactory: (port: RoutinesQueryPort) => new ListRoutinesUseCase(port),
    },
    {
      provide: GetRoutineUseCase,
      inject: [RoutinesQueryPort],
      useFactory: (port: RoutinesQueryPort) => new GetRoutineUseCase(port),
    },
  ],
})
export class RoutinesModule {}
