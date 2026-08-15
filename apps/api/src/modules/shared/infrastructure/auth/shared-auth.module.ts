import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { SharedConfigModule } from '../config/shared-config.module';
import { SharedDatabaseModule } from '../database/shared-database.module';
import { PrismaService } from '../database/prisma/prisma.service';
import { createAuth } from './auth';

@Module({
  imports: [
    SharedDatabaseModule,
    SharedConfigModule,
    AuthModule.forRootAsync({
      imports: [SharedDatabaseModule, SharedConfigModule],
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, configService: ConfigService) => ({
        auth: createAuth(prisma, configService),
      }),
    }),
  ],
  exports: [AuthModule],
})
export class SharedAuthModule {}
