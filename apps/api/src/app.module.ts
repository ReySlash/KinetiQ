import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { MusclesModule } from './muscles/muscles.module';
import { MuscleGroupsModule } from './muscle-groups/muscle-groups.module';
import { ExercisesModule } from './exercises/exercises.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './auth/auth';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { RoutinesModule } from './routines/routines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, configService: ConfigService) => ({
        auth: createAuth(prisma, configService),
      }),
    }),
    MusclesModule,
    MuscleGroupsModule,
    ExercisesModule,
    HealthModule,
    RoutinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
