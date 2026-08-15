import { Module } from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service';
import { MuscleGroupsController } from './muscle-groups.controller';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [MuscleGroupsController],
  providers: [MuscleGroupsService],
})
export class MuscleGroupsModule {}
