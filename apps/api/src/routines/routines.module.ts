import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [RoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
