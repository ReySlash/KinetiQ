import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { MusclesModule } from './muscles/muscles.module';
import { MuscleGroupsModule } from './muscle-groups/muscle-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    MusclesModule,
    MuscleGroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
