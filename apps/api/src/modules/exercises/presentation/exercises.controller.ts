import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetExerciseUseCase } from '../application/use-cases/queries/get-exercise.use-case';
import { ListExercisesUseCase } from '../application/use-cases/queries/list-exercises.use-case';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';
import { toExercisesHttpException } from './exercises-exception.mapper';

@Controller('exercises')
@AllowAnonymous()
export class ExercisesController {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly getExercise: GetExerciseUseCase,
  ) {}

  @Get()
  async findAll(@Query() findExercisesQueryDto: FindExercisesQueryDto) {
    try {
      return await this.listExercises.execute(findExercisesQueryDto);
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getExercise.execute(slug);
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }
}
