import { Controller, Get, Param } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetMuscleGroupUseCase } from '../application/use-cases/queries/get-muscle-group.use-case';
import { ListMuscleGroupsUseCase } from '../application/use-cases/queries/list-muscle-groups.use-case';
import { toMuscleGroupsHttpException } from './muscle-groups-exception.mapper';

@Controller('muscle-groups')
@AllowAnonymous()
export class MuscleGroupsController {
  constructor(
    private readonly listMuscleGroups: ListMuscleGroupsUseCase,
    private readonly getMuscleGroup: GetMuscleGroupUseCase,
  ) {}

  @Get()
  async findAll() {
    try {
      return await this.listMuscleGroups.execute();
    } catch (error) {
      throw toMuscleGroupsHttpException(error, 'Failed to fetch muscle groups');
    }
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    try {
      return await this.getMuscleGroup.execute(slug);
    } catch (error) {
      throw toMuscleGroupsHttpException(error, 'Failed to fetch muscle group');
    }
  }
}
