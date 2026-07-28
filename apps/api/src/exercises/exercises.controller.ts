import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query() findExercisesQueryDto: FindExercisesQueryDto) {
    return this.exercisesService.findAll(findExercisesQueryDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.exercisesService.findOne(slug);
  }
}
