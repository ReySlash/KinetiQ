import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { CreateMuscleDto } from './dto/create-muscle.dto';

@Controller('muscles')
export class MusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Post()
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.musclesService.create(createMuscleDto);
  }

  @Get()
  findAll() {
    return this.musclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musclesService.findOne(id);
  }
}
