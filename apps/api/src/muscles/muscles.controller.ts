import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { PaginationDto } from './dto/pagination-muscle.dto';

@Controller('muscles')
export class MusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Post()
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.musclesService.create(createMuscleDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.musclesService.findAll(paginationDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.musclesService.findOne(slug);
  }
}
