import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from './modules/shared/infrastructure/shared-infrastructure.module';
import { MusclesModule } from './modules/muscles/muscles.module';
import { MuscleGroupsModule } from './modules/muscle-groups/muscle-groups.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { HealthModule } from './health/health.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { TrainingProgramsModule } from './modules/training-programs/training-programs.module';
import { WorkoutSessionsModule } from './modules/workout-sessions/workout-sessions.module';

@Module({
  imports: [
    SharedInfrastructureModule,
    MusclesModule,
    MuscleGroupsModule,
    ExercisesModule,
    HealthModule,
    RoutinesModule,
    TrainingProgramsModule,
    WorkoutSessionsModule,
  ],
})
export class AppModule {}
