import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AdminExercisesController } from './admin-exercises.controller';
import { SharedDatabaseModule } from '../modules/shared/infrastructure/database/shared-database.module';

@Module({
  imports: [SharedDatabaseModule],
  controllers: [ExercisesController, AdminExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}
