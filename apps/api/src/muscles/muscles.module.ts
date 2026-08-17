import { Module } from '@nestjs/common';
import { AdminMusclesController } from './presentation/admin-muscles.controller';
import { MusclesController } from './presentation/muscles.controller';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';
import { PrismaMusclesAdapter } from './infrastructure/prisma/prisma-muscles.adapter';
import { MusclesCommandPort } from './application/ports/muscles-command.port';
import { MusclesQueriesPort } from './application/ports/muscles-queries.port';
import { CreateMuscleUseCase } from './application/use-cases/commands/create-muscle.use-case';
import { UpdateMuscleUseCase } from './application/use-cases/commands/update-muscle.use-case';
import { DeactivateMuscleUseCase } from './application/use-cases/commands/deactivate-muscle.use-case';
import { ListMusclesUseCase } from './application/use-cases/queries/list-muscles.use-case';
import { GetMuscleUseCase } from './application/use-cases/queries/get-muscle.use-case';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [MusclesController, AdminMusclesController],
  providers: [
    PrismaMusclesAdapter,
    {
      provide: MusclesCommandPort,
      useExisting: PrismaMusclesAdapter,
    },
    {
      provide: MusclesQueriesPort,
      useExisting: PrismaMusclesAdapter,
    },
    {
      provide: CreateMuscleUseCase,
      inject: [MusclesCommandPort],
      useFactory: (port: MusclesCommandPort) => new CreateMuscleUseCase(port),
    },
    {
      provide: UpdateMuscleUseCase,
      inject: [MusclesCommandPort],
      useFactory: (port: MusclesCommandPort) => new UpdateMuscleUseCase(port),
    },
    {
      provide: DeactivateMuscleUseCase,
      inject: [MusclesCommandPort],
      useFactory: (port: MusclesCommandPort) =>
        new DeactivateMuscleUseCase(port),
    },
    {
      provide: ListMusclesUseCase,
      inject: [MusclesQueriesPort],
      useFactory: (port: MusclesQueriesPort) => new ListMusclesUseCase(port),
    },
    {
      provide: GetMuscleUseCase,
      inject: [MusclesQueriesPort],
      useFactory: (port: MusclesQueriesPort) => new GetMuscleUseCase(port),
    },
  ],
})
export class MusclesModule {}
