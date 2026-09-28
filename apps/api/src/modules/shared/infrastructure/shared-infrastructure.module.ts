import { Module } from '@nestjs/common';
import { SharedAuthModule } from './auth/shared-auth.module';
import { SharedConfigModule } from './config/shared-config.module';
import { SharedDatabaseModule } from './database/shared-database.module';
import { SharedRateLimitModule } from './rate-limit/shared-rate-limit.module';
import { SharedSecurityModule } from './security/shared-security.module';
import { SharedMonitoringModule } from './monitoring/shared-monitoring.module';

@Module({
  imports: [
    SharedConfigModule,
    SharedDatabaseModule,
    SharedAuthModule,
    SharedRateLimitModule,
    SharedSecurityModule,
    SharedMonitoringModule,
  ],
  exports: [
    SharedConfigModule,
    SharedDatabaseModule,
    SharedAuthModule,
    SharedRateLimitModule,
    SharedSecurityModule,
  ],
})
export class SharedInfrastructureModule {}
