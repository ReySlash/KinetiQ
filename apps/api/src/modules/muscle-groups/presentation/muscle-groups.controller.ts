import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetMuscleGroupUseCase } from '../application/use-cases/queries/get-muscle-group.use-case';
import { ListMuscleGroupsUseCase } from '../application/use-cases/queries/list-muscle-groups.use-case';
import { toMuscleGroupsHttpException } from './muscle-groups-exception.mapper';

@Controller('muscle-groups')
@ApiTags('muscle-groups')
@AllowAnonymous()
export class MuscleGroupsController {
  constructor(
    private readonly listMuscleGroups: ListMuscleGroupsUseCase,
    private readonly getMuscleGroup: GetMuscleGroupUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List muscle groups' })
  @ApiResponse({ status: 200 })
  async findAll() {
    try {
      return await this.listMuscleGroups.execute();
    } catch (error) {
      throw toMuscleGroupsHttpException(error, 'Failed to fetch muscle groups');
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a muscle group by slug' })
  @ApiParam({ name: 'slug', example: 'upper-body' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Muscle group not found' })
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getMuscleGroup.execute(slug);
    } catch (error) {
      throw toMuscleGroupsHttpException(error, 'Failed to fetch muscle group');
    }
  }
}
