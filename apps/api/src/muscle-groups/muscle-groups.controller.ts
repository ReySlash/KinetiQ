import { Controller, Get, Param } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { MuscleGroupsService } from './muscle-groups.service';

@Controller('muscle-groups')
@AllowAnonymous()
export class MuscleGroupsController {
  constructor(private readonly muscleGroupsService: MuscleGroupsService) {}

  @Get()
  findAll() {
    return this.muscleGroupsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.muscleGroupsService.findOne(slug);
  }
}
