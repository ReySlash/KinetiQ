import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { PaginationExercisesDto } from './dto/pagination-exercises.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query() PaginationExercisesDto: PaginationExercisesDto) {
    return this.exercisesService.findAll(PaginationExercisesDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.exercisesService.findOne(slug);
  }
}
