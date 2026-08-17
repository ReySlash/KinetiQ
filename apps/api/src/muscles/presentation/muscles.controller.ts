import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetMuscleUseCase } from '../application/use-cases/queries/get-muscle.use-case';
import { ListMusclesUseCase } from '../application/use-cases/queries/list-muscles.use-case';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { toMusclesHttpException } from './muscles-exception.mapper';

@Controller('muscles')
@AllowAnonymous()
export class MusclesController {
  constructor(
    private readonly listMuscles: ListMusclesUseCase,
    private readonly getMuscle: GetMuscleUseCase,
  ) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      return await this.listMuscles.execute(paginationDto);
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getMuscle.execute(slug);
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }
}
