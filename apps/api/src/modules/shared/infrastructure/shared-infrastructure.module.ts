import { Module } from '@nestjs/common';
import { SharedAuthModule } from './auth/shared-auth.module';
import { SharedConfigModule } from './config/shared-config.module';
import { SharedDatabaseModule } from './database/shared-database.module';
import { SharedRateLimitModule } from './rate-limit/shared-rate-limit.module';

@Module({
  imports: [
    SharedConfigModule,
    SharedDatabaseModule,
    SharedAuthModule,
    SharedRateLimitModule,
  ],
  exports: [
    SharedConfigModule,
    SharedDatabaseModule,
    SharedAuthModule,
    SharedRateLimitModule,
  ],
})
export class SharedInfrastructureModule {}
