import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetMuscleUseCase } from '../application/use-cases/queries/get-muscle.use-case';
import { ListMusclesUseCase } from '../application/use-cases/queries/list-muscles.use-case';
import { PaginationDto } from './dto/pagination-muscle.dto';
import { toMusclesHttpException } from './muscles-exception.mapper';

@Controller('muscles')
@ApiTags('muscles')
@AllowAnonymous()
export class MusclesController {
  constructor(
    private readonly listMuscles: ListMusclesUseCase,
    private readonly getMuscle: GetMuscleUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List muscles' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      return await this.listMuscles.execute(paginationDto);
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a muscle by slug' })
  @ApiParam({ name: 'slug', example: 'biceps-brachii' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Muscle not found' })
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getMuscle.execute(slug);
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }
}
