import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AdminExercisesController } from './admin-exercises.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExercisesController, AdminExercisesController],
  providers: [ExercisesService],
})
export class ExercisesModule {}
