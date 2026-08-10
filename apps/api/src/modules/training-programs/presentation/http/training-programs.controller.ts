import { Body, Controller, Get, Post } from '@nestjs/common';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import {
  CurrentPrincipal,
  type AuthenticatedPrincipal,
} from '../../../../auth/principal';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/list-training-programs.use-case';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/create-training-programs.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(
    private readonly listTrainingPrograms: ListTrainingProgramsUseCase,
    private readonly createTrainingProgram: CreateTrainingProgramUseCase,
  ) {}

  @Get()
  @OptionalAuth()
  findAll() {
    return this.listTrainingPrograms.execute();
  }

  @Post()
  create(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() createTrainingProgramDto: CreateTrainingProgramDto,
  ) {
    return this.createTrainingProgram.execute({
      ownerId: principal.userId,
      name: createTrainingProgramDto.name,
      slug: createTrainingProgramDto.slug,
      description: createTrainingProgramDto.description ?? null,
      durationWeeks: createTrainingProgramDto.durationWeeks,
    });
  }
}
