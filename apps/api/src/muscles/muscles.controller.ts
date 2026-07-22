import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';

@Controller('muscles')
export class MusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.musclesService.findAll(paginationDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.musclesService.findOne(slug);
  }

  @Post()
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.musclesService.create(createMuscleDto);
  }

  @Patch(':slug')
  update(
    @Param('slug') slug: string,
    @Body() updateMuscleDto: UpdateMuscleDto,
  ) {
    return this.musclesService.update(slug, updateMuscleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musclesService.remove(id);
  }
}
