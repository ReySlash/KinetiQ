import { Module } from '@nestjs/common';
import { SharedAuthModule } from './auth/shared-auth.module';
import { SharedConfigModule } from './config/shared-config.module';
import { SharedDatabaseModule } from './database/shared-database.module';

@Module({
  imports: [SharedConfigModule, SharedDatabaseModule, SharedAuthModule],
  exports: [SharedConfigModule, SharedDatabaseModule, SharedAuthModule],
})
export class SharedInfrastructureModule {}
