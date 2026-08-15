import { Module } from '@nestjs/common';
import { SharedInfrastructureModule } from './modules/shared/infrastructure/shared-infrastructure.module';
import { MusclesModule } from './muscles/muscles.module';
import { MuscleGroupsModule } from './muscle-groups/muscle-groups.module';
import { ExercisesModule } from './exercises/exercises.module';
import { HealthModule } from './health/health.module';
import { RoutinesModule } from './routines/routines.module';
import { TrainingProgramsModule } from './modules/training-programs/training-programs.module';

@Module({
  imports: [
    SharedInfrastructureModule,
    MusclesModule,
    MuscleGroupsModule,
    ExercisesModule,
    HealthModule,
    RoutinesModule,
    TrainingProgramsModule,
  ],
})
export class AppModule {}
