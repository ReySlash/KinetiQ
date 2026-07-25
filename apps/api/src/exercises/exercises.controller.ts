import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { PaginationDto } from '../muscles/dto/pagination-muscle.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.exercisesService.findAll(paginationDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.exercisesService.findOne(slug);
  }
}
