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
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import { MusclesService } from './muscles.service';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';

@Controller('muscles')
export class MusclesController {
  constructor(private readonly musclesService: MusclesService) {}

  @Get()
  @AllowAnonymous()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.musclesService.findAll(paginationDto);
  }

  @Get(':slug')
  @AllowAnonymous()
  findOne(@Param('slug') slug: string) {
    return this.musclesService.findOne(slug);
  }

  @Post()
  @Roles(['ADMIN'])
  create(@Body() createMuscleDto: CreateMuscleDto) {
    return this.musclesService.create(createMuscleDto);
  }

  @Patch(':slug')
  @Roles(['ADMIN'])
  update(
    @Param('slug') slug: string,
    @Body() updateMuscleDto: UpdateMuscleDto,
  ) {
    return this.musclesService.update(slug, updateMuscleDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  remove(@Param('id') id: string) {
    return this.musclesService.remove(id);
  }
}
