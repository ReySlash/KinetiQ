import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetExerciseUseCase } from '../application/use-cases/queries/get-exercise.use-case';
import { ListExercisesUseCase } from '../application/use-cases/queries/list-exercises.use-case';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';
import { toExercisesHttpException } from './exercises-exception.mapper';

@Controller('exercises')
@ApiTags('exercises')
@AllowAnonymous()
export class ExercisesController {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly getExercise: GetExerciseUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active exercises' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'forceType', required: false })
  @ApiQuery({ name: 'laterality', required: false })
  @ApiQuery({ name: 'skillLevel', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async findAll(@Query() findExercisesQueryDto: FindExercisesQueryDto) {
    try {
      return await this.listExercises.execute(findExercisesQueryDto);
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an exercise by slug' })
  @ApiParam({ name: 'slug', example: 'barbell-back-squat' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getExercise.execute(slug);
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }
}
