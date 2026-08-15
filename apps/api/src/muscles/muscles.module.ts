import { Module } from '@nestjs/common';
import { AdminMusclesController } from './admin-muscles.controller';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [MusclesController, AdminMusclesController],
  providers: [MusclesService],
})
export class MusclesModule {}
