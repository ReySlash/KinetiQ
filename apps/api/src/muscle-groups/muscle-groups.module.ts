import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';
import { MuscleGroupsQueriesPort } from './application/ports/muscle-groups-queries.port';
import { GetMuscleGroupUseCase } from './application/use-cases/queries/get-muscle-group.use-case';
import { ListMuscleGroupsUseCase } from './application/use-cases/queries/list-muscle-groups.use-case';
import { PrismaMuscleGroupsAdapter } from './infrastructure/prisma/prisma-muscle-groups.adapter';
import { MuscleGroupsController } from './presentation/muscle-groups.controller';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [MuscleGroupsController],
  providers: [
    PrismaMuscleGroupsAdapter,
    {
      provide: MuscleGroupsQueriesPort,
      useExisting: PrismaMuscleGroupsAdapter,
    },
    {
      provide: ListMuscleGroupsUseCase,
      inject: [MuscleGroupsQueriesPort],
      useFactory: (port: MuscleGroupsQueriesPort) =>
        new ListMuscleGroupsUseCase(port),
    },
    {
      provide: GetMuscleGroupUseCase,
      inject: [MuscleGroupsQueriesPort],
      useFactory: (port: MuscleGroupsQueriesPort) =>
        new GetMuscleGroupUseCase(port),
    },
  ],
})
export class MuscleGroupsModule {}
