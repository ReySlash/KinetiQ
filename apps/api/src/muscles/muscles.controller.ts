import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { MusclesService } from './muscles.service';
import { PaginationDto } from './dto/pagination-muscle.dto';

@Controller('muscles')
@AllowAnonymous()
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
}
