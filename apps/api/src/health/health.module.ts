import { Module } from '@nestjs/common';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
