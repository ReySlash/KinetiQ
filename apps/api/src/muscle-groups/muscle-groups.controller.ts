import { Controller, Get, Param } from '@nestjs/common';
import { MuscleGroupsService } from './muscle-groups.service';

@Controller('muscle-groups')
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
